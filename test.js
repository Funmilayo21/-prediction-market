const PredictionMarket = require('./prediction-market');

// Test helper
function assert(condition, message) {
    if (!condition) {
        console.error('❌ Test failed:', message);
        process.exit(1);
    }
    console.log('✓', message);
}

// Run tests
console.log('Running Prediction Market Tests...\n');

// Test 1: Create Market
const market = new PredictionMarket();
const testMarket = market.createMarket(
    "Test Question?",
    new Date(Date.now() + 86400000),
    ["Yes", "No"]
);
assert(testMarket.id === 1, 'Market should be created with ID 1');
assert(testMarket.question === "Test Question?", 'Market question should match');
assert(testMarket.status === 'open', 'New market should be open');

// Test 2: Get Market
const retrievedMarket = market.getMarket(1);
assert(retrievedMarket !== null, 'Should retrieve created market');
assert(retrievedMarket.id === 1, 'Retrieved market should have correct ID');

// Test 3: Place Prediction
const prediction = market.placePrediction(1, 'user1', 'Yes', 100);
assert(prediction.id === 1, 'Prediction should be created with ID 1');
assert(prediction.marketId === 1, 'Prediction should reference correct market');
assert(prediction.userId === 'user1', 'Prediction should have correct user');
assert(prediction.outcome === 'Yes', 'Prediction should have correct outcome');
assert(prediction.amount === 100, 'Prediction should have correct amount');

// Test 4: Multiple Predictions
market.placePrediction(1, 'user2', 'No', 50);
market.placePrediction(1, 'user3', 'Yes', 150);
const predictions = market.getPredictionsForMarket(1);
assert(predictions.length === 3, 'Should have 3 predictions for market');

// Test 5: Get Market Stats
const stats = market.getMarketStats(1);
assert(stats.totalPredictions === 3, 'Stats should show 3 predictions');
assert(stats.totalAmount === 300, 'Total amount should be 300');
assert(stats.outcomeStats['Yes'].count === 2, 'Yes should have 2 predictions');
assert(stats.outcomeStats['No'].count === 1, 'No should have 1 prediction');
assert(stats.outcomeStats['Yes'].amount === 250, 'Yes should have amount 250');
assert(stats.outcomeStats['No'].amount === 50, 'No should have amount 50');

// Test 6: Get User Predictions
const userPredictions = market.getPredictionsForUser('user1');
assert(userPredictions.length === 1, 'User1 should have 1 prediction');
assert(userPredictions[0].outcome === 'Yes', 'User1 prediction should be Yes');

// Test 7: Resolve Market
const resolvedMarket = market.resolveMarket(1, 'Yes');
assert(resolvedMarket.status === 'resolved', 'Market should be resolved');
assert(resolvedMarket.resolvedOutcome === 'Yes', 'Resolved outcome should be Yes');

// Test 8: Error - Invalid Prediction Amount
try {
    market.createMarket("Test 2?", new Date(Date.now() + 86400000));
    market.placePrediction(2, 'user1', 'Yes', -10);
    assert(false, 'Should throw error for negative amount');
} catch (error) {
    assert(error.message === 'Amount must be positive', 'Should throw correct error for negative amount');
}

// Test 9: Error - Place Prediction on Resolved Market
try {
    market.placePrediction(1, 'user4', 'Yes', 100);
    assert(false, 'Should throw error for prediction on resolved market');
} catch (error) {
    assert(error.message === 'Market is not open', 'Should throw correct error for resolved market');
}

// Test 10: Error - Invalid Outcome
try {
    market.createMarket("Test 3?", new Date(Date.now() + 86400000), ["A", "B"]);
    market.placePrediction(3, 'user1', 'C', 100);
    assert(false, 'Should throw error for invalid outcome');
} catch (error) {
    assert(error.message === 'Invalid outcome', 'Should throw correct error for invalid outcome');
}

// Test 11: Get All Markets
const allMarkets = market.getAllMarkets();
assert(allMarkets.length === 3, 'Should have 3 markets total');

console.log('\n✅ All tests passed!');
