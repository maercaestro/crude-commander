import { calculateNewPosition } from './utils/shipMovement';

class TimeEngine {
  constructor() {
    this.months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.currentMonthIndex = 0;
    this.planningHorizon = 2;
    this.planningSchedule = {};
    this.dailyData = {};
  }

  // Get the current month name.
  getCurrentMonth() {
    return this.months[this.currentMonthIndex];
  }

  // Advance to the next month.
  getNextMonth() {
    this.currentMonthIndex = (this.currentMonthIndex + 1) % this.months.length;
    return this.getCurrentMonth();
  }

  // Get a future month based on an offset.
  getFutureMonth(offset) {
    const futureIndex = (this.currentMonthIndex + offset) % this.months.length;
    return this.months[futureIndex];
  }

  // Planning Phase: Store decisions for a target month.
  planForFutureMonth(targetMonth, decisions) {
    this.planningSchedule[targetMonth] = decisions;
    console.log(`Planned decisions for ${targetMonth}:`, decisions);
  }

  // Execution Phase: Simulate daily events for the specified month.
  executeMonth(month) {
    const decisions = this.planningSchedule[month] || {};
    console.log(`Executing month: ${month} with decisions:`, decisions);
    
    // Assume 30 days in a month.
    for (let day = 1; day <= 30; day++) {
      this.updateShipPositions(day, decisions);
      this.adjustProductionRates(day, decisions);
      this.processPortOperations(day, decisions);
      this.recordDailyData(month, day, decisions);
    }
    
    this.aggregateMonthlyData(month);
  }

  // Update ship positions.
  updateShipPositions(ships, terminals) {
    return ships.map(ship => {
      if (!ship.data?.destination) return ship;

      // Find destination terminal
      const destinationTerminal = terminals.find(
        terminal => terminal.name === ship.data.destination
      );

      if (!destinationTerminal) return ship;

      // Calculate new position
      const newPosition = calculateNewPosition(
        ship.position,
        destinationTerminal.position
      );

      return {
        ...ship,
        position: {
          x: newPosition.x,
          y: newPosition.y
        },
        rotation: newPosition.rotation
      };
    });
  }

  // Placeholder: Adjust production rates.
  adjustProductionRates(day, decisions) {
    console.log(`Day ${day}: Adjusting production rates.`);
  }

  // Placeholder: Process loading/discharge activities.
  processPortOperations(day, decisions) {
    console.log(`Day ${day}: Processing port operations.`);
  }

  // Record daily data.
  recordDailyData(month, day, decisions) {
    if (!this.dailyData[month]) {
      this.dailyData[month] = [];
    }
    const dayData = { day, decisions, timestamp: new Date() };
    this.dailyData[month].push(dayData);
    console.log(`Recording data for ${month} Day ${day}:`, dayData);
  }

  // Aggregate daily data (optional).
  aggregateMonthlyData(month) {
    console.log(`Aggregating data for ${month}.`);
  }

  // Advance month: execute simulation and prompt planning.
  advanceMonth() {
    const newMonth = this.getNextMonth();
    this.executeMonth(newMonth);
    const futureMonth = this.getFutureMonth(this.planningHorizon);
    console.log(`Please plan for ${futureMonth}.`);
    return { newMonth, futureMonth };
  }
}

export default TimeEngine;