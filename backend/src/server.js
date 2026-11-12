require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const { RouteOptimizer } = require('./algorithms/routeOptimizer');
const LiveSimulationEngine = require('./simulation/trafficSimulator');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Initialize Routing Engine & Simulation Engine
const routeOptimizer = new RouteOptimizer();
const simulationEngine = new LiveSimulationEngine(io, routeOptimizer);

// Mount API Routes
const trafficRoutes = require('./routes/trafficRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes')(routeOptimizer, simulationEngine);
const cityRoutes = require('./routes/cityRoutes');
const routingRoutes = require('./routes/routingRoutes');

app.use('/api/traffic', trafficRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/routes', routingRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'ROAD RESQ AI - Smart Traffic & Emergency Optimization',
    simulationRunning: simulationEngine.isRunning,
    timestamp: new Date()
  });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`📡 Dashboard client connected: ${socket.id}`);
  socket.emit('init-state', {
    ambulance: simulationEngine.ambulance,
    isSimulationRunning: simulationEngine.isRunning
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Start server and initialize database & simulation
(async () => {
  await connectDB();
  await simulationEngine.seedSignals();
  simulationEngine.start();

  server.listen(PORT, () => {
    console.log(`🚀 ROAD RESQ AI Backend running at http://localhost:${PORT}`);
  });
})();

