const EventEmitter = require('events');

class InMemoryJobQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.completedCount = 0;
    this.failedCount = 0;
  }

  async add(jobType, data) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job = {
      id: jobId,
      type: jobType,
      data,
      status: 'QUEUED',
      attempts: 0,
      createdAt: new Date()
    };

    this.jobs.set(jobId, job);
    
    // Asynchronous non-blocking dispatch
    setImmediate(() => this.processJob(job));
    return job;
  }

  async processJob(job) {
    job.status = 'PROCESSING';
    job.attempts += 1;

    try {
      this.emit(job.type, job.data);
      job.status = 'COMPLETED';
      this.completedCount += 1;
    } catch (err) {
      console.error(`[Worker Queue Error] Job ${job.id} failed:`, err.message);
      if (job.attempts < 3) {
        job.status = 'RETRYING';
        setTimeout(() => this.processJob(job), 1000 * job.attempts);
      } else {
        job.status = 'FAILED';
        this.failedCount += 1;
      }
    }
  }

  getMetrics() {
    return {
      activeQueueSize: Array.from(this.jobs.values()).filter(j => j.status === 'QUEUED' || j.status === 'PROCESSING').length,
      completedJobs: this.completedCount,
      failedJobs: this.failedCount
    };
  }
}

class BackgroundWorkerManager {
  constructor() {
    this.redisClient = null;
    this.isRedisConnected = false;
    this.memoryQueue = new InMemoryJobQueue();
    this.init();
  }

  init() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      const Redis = require('ioredis');
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null // don't spam if standalone redis not present
      });

      this.redisClient.on('connect', () => {
        this.isRedisConnected = true;
        console.log('✅ Redis connected for background processing.');
      });

      this.redisClient.on('error', () => {
        this.isRedisConnected = false;
        // Silent fallback to memory queue
      });
    } catch (e) {
      this.isRedisConnected = false;
    }
  }

  async enqueue(jobType, data) {
    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.lpush(`roadresq:queue:${jobType}`, JSON.stringify(data));
        return { queued: true, provider: 'REDIS' };
      } catch (err) {
        return this.memoryQueue.add(jobType, data);
      }
    }
    return this.memoryQueue.add(jobType, data);
  }

  getStatus() {
    return {
      redisConnected: this.isRedisConnected,
      queueProvider: this.isRedisConnected ? 'REDIS_CACHE_BROKER' : 'IN_MEMORY_EVENT_DISPATCHER',
      metrics: this.memoryQueue.getMetrics()
    };
  }
}

module.exports = new BackgroundWorkerManager();
