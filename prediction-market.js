/**
 * Prediction Market - Core Logic
 * A simple prediction market where users can create markets and place predictions
 */

class PredictionMarket {
  constructor() {
    this.markets = [];
    this.predictions = [];
    this.nextMarketId = 1;
    this.nextPredictionId = 1;
  }

  /**
   * Create a new prediction market
   * @param {string} question - The question or event to predict
   * @param {Date} closeDate - When the market closes
   * @param {string[]} outcomes - Possible outcomes (e.g., ["Yes", "No"])
   * @returns {Object} The created market
   */
  createMarket(question, closeDate, outcomes = ["Yes", "No"]) {
    const market = {
      id: this.nextMarketId++,
      question,
      closeDate: new Date(closeDate),
      outcomes,
      status: "open",
      createdAt: new Date(),
      resolvedOutcome: null
    };
    this.markets.push(market);
    return market;
  }

  /**
   * Place a prediction on a market
   * @param {number} marketId - The market ID
   * @param {string} userId - The user placing the prediction
   * @param {string} outcome - The predicted outcome
   * @param {number} amount - Amount to stake
   * @returns {Object} The created prediction
   */
  placePrediction(marketId, userId, outcome, amount) {
    const market = this.getMarket(marketId);
    
    if (!market) {
      throw new Error("Market not found");
    }
    
    if (market.status !== "open") {
      throw new Error("Market is not open");
    }
    
    if (new Date() > market.closeDate) {
      throw new Error("Market has closed");
    }
    
    if (!market.outcomes.includes(outcome)) {
      throw new Error("Invalid outcome");
    }
    
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const prediction = {
      id: this.nextPredictionId++,
      marketId,
      userId,
      outcome,
      amount,
      createdAt: new Date()
    };
    
    this.predictions.push(prediction);
    return prediction;
  }

  /**
   * Get a market by ID
   * @param {number} marketId - The market ID
   * @returns {Object|null} The market or null if not found
   */
  getMarket(marketId) {
    return this.markets.find(m => m.id === marketId) || null;
  }

  /**
   * Get all markets
   * @returns {Object[]} Array of all markets
   */
  getAllMarkets() {
    return [...this.markets];
  }

  /**
   * Get all predictions for a market
   * @param {number} marketId - The market ID
   * @returns {Object[]} Array of predictions
   */
  getPredictionsForMarket(marketId) {
    return this.predictions.filter(p => p.marketId === marketId);
  }

  /**
   * Get all predictions for a user
   * @param {string} userId - The user ID
   * @returns {Object[]} Array of predictions
   */
  getPredictionsForUser(userId) {
    return this.predictions.filter(p => p.userId === userId);
  }

  /**
   * Resolve a market with the winning outcome
   * @param {number} marketId - The market ID
   * @param {string} winningOutcome - The winning outcome
   * @returns {Object} The resolved market
   */
  resolveMarket(marketId, winningOutcome) {
    const market = this.getMarket(marketId);
    
    if (!market) {
      throw new Error("Market not found");
    }
    
    if (market.status === "resolved") {
      throw new Error("Market already resolved");
    }
    
    if (!market.outcomes.includes(winningOutcome)) {
      throw new Error("Invalid outcome");
    }

    market.status = "resolved";
    market.resolvedOutcome = winningOutcome;
    market.resolvedAt = new Date();
    
    return market;
  }

  /**
   * Calculate statistics for a market
   * @param {number} marketId - The market ID
   * @returns {Object} Market statistics
   */
  getMarketStats(marketId) {
    const market = this.getMarket(marketId);
    
    if (!market) {
      throw new Error("Market not found");
    }

    const predictions = this.getPredictionsForMarket(marketId);
    const stats = {
      totalPredictions: predictions.length,
      totalAmount: 0,
      outcomeStats: {}
    };

    // Initialize outcome stats
    market.outcomes.forEach(outcome => {
      stats.outcomeStats[outcome] = {
        count: 0,
        amount: 0,
        percentage: 0
      };
    });

    // Calculate totals
    predictions.forEach(prediction => {
      stats.totalAmount += prediction.amount;
      stats.outcomeStats[prediction.outcome].count++;
      stats.outcomeStats[prediction.outcome].amount += prediction.amount;
    });

    // Calculate percentages
    if (stats.totalAmount > 0) {
      market.outcomes.forEach(outcome => {
        stats.outcomeStats[outcome].percentage = 
          (stats.outcomeStats[outcome].amount / stats.totalAmount * 100).toFixed(2);
      });
    }

    return stats;
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PredictionMarket;
}
