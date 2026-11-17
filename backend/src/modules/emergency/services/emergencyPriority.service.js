/**
 * Emergency Priority Engine
 * Evaluates explainable multi-factor severity scores (0-100)
 */

class EmergencyPriorityEngine {
  /**
   * Calculates priority score and detailed explainable factors
   */
  calculatePriority(incident) {
    const {
      severity = 'HIGH',
      waitingDurationMinutes = 0,
      affectedPeopleCount = 1,
      emergencyCategory = 'ACCIDENT',
      roadBlocked = false,
      ambulanceAvailable = true
    } = incident;

    // 1. Base Severity Score (0 - 35 points)
    let severityScore = 20;
    if (severity === 'CRITICAL') severityScore = 35;
    else if (severity === 'HIGH') severityScore = 25;
    else if (severity === 'MODERATE') severityScore = 15;
    else if (severity === 'LOW') severityScore = 8;

    // 2. Waiting Duration Penalty (0 - 25 points, escalates 2.5 pts per 5 mins waiting, max 25)
    const waitingScore = Math.min(25, Math.round((waitingDurationMinutes / 5) * 2.5));

    // 3. Affected People Factor (0 - 15 points)
    const affectedScore = Math.min(15, Math.max(3, affectedPeopleCount * 3));

    // 4. Emergency Category Weight (0 - 15 points)
    let categoryScore = 10;
    if (emergencyCategory === 'CARDIAC_ARREST' || emergencyCategory === 'MASS_CASUALTY') categoryScore = 15;
    else if (emergencyCategory === 'MULTI_VEHICLE_CRASH' || emergencyCategory === 'TRAUMA') categoryScore = 13;
    else if (emergencyCategory === 'FIRE_EMERGENCY') categoryScore = 12;
    else if (emergencyCategory === 'ACCIDENT') categoryScore = 10;

    // 5. Road Accessibility Penalty (-5 to +5 points)
    const roadPenalty = roadBlocked ? 5 : 0;

    // 6. Resource Availability Urgency (0 to +5 points)
    const resourceUrgency = ambulanceAvailable ? 0 : 5;

    // Total Normalized Score (0 - 100)
    const totalScore = Math.min(100, Math.max(10, severityScore + waitingScore + affectedScore + categoryScore + roadPenalty + resourceUrgency));

    let severityLevel = 'MODERATE';
    if (totalScore >= 80) severityLevel = 'CRITICAL';
    else if (totalScore >= 60) severityLevel = 'HIGH';
    else if (totalScore >= 35) severityLevel = 'MODERATE';
    else severityLevel = 'LOW';

    const explanation = `Score ${totalScore}/100 [${severityLevel}]: Base severity (${severityScore}pts) + Waiting time ${waitingDurationMinutes}m (${waitingScore}pts) + Affected count ${affectedPeopleCount} (${affectedScore}pts) + Category ${emergencyCategory} (${categoryScore}pts) + Accessibility factors (${roadPenalty + resourceUrgency}pts).`;

    return {
      score: totalScore,
      severityLevel,
      factors: {
        incidentSeverity: severityScore,
        waitingDurationMinutes: waitingScore,
        affectedCount: affectedScore,
        emergencyCategoryWeight: categoryScore,
        roadAccessibilityPenalty: roadPenalty,
        resourceAvailabilityPenalty: resourceUrgency
      },
      explanation
    };
  }
}

module.exports = new EmergencyPriorityEngine();
