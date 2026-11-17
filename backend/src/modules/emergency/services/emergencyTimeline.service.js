const EmergencyTimeline = require('../../../models/EmergencyTimeline');

class EmergencyTimelineService {
  /**
   * Initializes or gets timeline for an incident
   */
  async getOrCreateTimeline(incidentId, cityId = 'chennai') {
    let timeline = await EmergencyTimeline.findOne({ incidentId });
    if (!timeline) {
      timeline = new EmergencyTimeline({
        incidentId,
        cityId,
        events: [{
          eventType: 'REPORT_CREATED',
          timestamp: new Date(),
          description: `Emergency incident ${incidentId} reported into ROAD RESQ system.`,
          metadata: { initialReport: true }
        }]
      });
      await timeline.save();
    }
    return timeline;
  }

  /**
   * Adds an event to the incident timeline with SLA evaluation
   */
  async recordEvent(incidentId, eventType, description, metadata = {}, io = null) {
    let timeline = await EmergencyTimeline.findOne({ incidentId });
    if (!timeline) {
      timeline = await this.getOrCreateTimeline(incidentId, metadata.cityId || 'chennai');
    }

    const event = {
      eventType,
      timestamp: new Date(),
      description,
      metadata
    };

    timeline.events.push(event);

    // Calculate SLA metrics
    const events = timeline.events;
    const createdEvent = events.find(e => e.eventType === 'REPORT_CREATED');
    const verifiedEvent = events.find(e => e.eventType === 'REPORT_VERIFIED');
    const assignedEvent = events.find(e => e.eventType === 'PRIORITY_ASSIGNED');
    const dispatchEvent = events.find(e => e.eventType === 'DISPATCH_INITIATED');
    const arrivedEvent = events.find(e => e.eventType === 'RESOURCE_ARRIVED');

    if (createdEvent && verifiedEvent) {
      timeline.metrics.reportToVerificationSec = Math.round((new Date(verifiedEvent.timestamp) - new Date(createdEvent.timestamp)) / 1000);
    }
    if (verifiedEvent && assignedEvent) {
      timeline.metrics.verificationToAssignmentSec = Math.round((new Date(assignedEvent.timestamp) - new Date(verifiedEvent.timestamp)) / 1000);
    }
    if (dispatchEvent && arrivedEvent) {
      timeline.metrics.dispatchToArrivalSec = Math.round((new Date(arrivedEvent.timestamp) - new Date(dispatchEvent.timestamp)) / 1000);
    }
    if (createdEvent && arrivedEvent) {
      timeline.metrics.totalResponseSec = Math.round((new Date(arrivedEvent.timestamp) - new Date(createdEvent.timestamp)) / 1000);
      if (timeline.metrics.totalResponseSec > 600) {
        timeline.slaStatus = 'BREACHED'; // SLA target is 10 minutes (600s)
      } else if (timeline.metrics.totalResponseSec > 420) {
        timeline.slaStatus = 'WARNING';
      } else {
        timeline.slaStatus = 'ON_TARGET';
      }
    }

    if (eventType === 'INCIDENT_RESOLVED') {
      timeline.resolvedAt = new Date();
    }

    await timeline.save();

    // Broadcast live timeline update via Socket.IO if instance provided
    if (io) {
      io.emit('emergency-timeline-update', {
        incidentId,
        timeline: timeline.toObject(),
        latestEvent: event
      });
    }

    return timeline;
  }

  async getIncidentTimeline(incidentId) {
    return await EmergencyTimeline.findOne({ incidentId });
  }

  async getAllTimelines(cityId = null, limit = 20) {
    const query = cityId ? { cityId } : {};
    return await EmergencyTimeline.find(query).sort({ createdAt: -1 }).limit(limit);
  }
}

module.exports = new EmergencyTimelineService();
