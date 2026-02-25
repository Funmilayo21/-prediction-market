# Prediction Market

A simple prediction market application where users can create markets about future events and make predictions on outcomes.

## Features

- 🎯 Create prediction markets with custom questions and outcomes
- 📊 Place predictions on market outcomes with stake amounts
- 📈 View real-time statistics and percentages for each outcome
- ⏰ Markets automatically close at specified dates
- 🎨 Beautiful, responsive web interface

## Getting Started

### Prerequisites

- Node.js (v12 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Start the server:

```bash
npm start
```

4. Open your browser and go to `http://localhost:3000`

## Usage

### Creating a Market

1. Fill in the market question (e.g., "Will it rain tomorrow?")
2. Set a closing date for the market
3. Enter possible outcomes separated by commas (e.g., "Yes, No")
4. Click "Create Market"

### Making Predictions

1. Click "Make Prediction" on any open market
2. Enter your name
3. Select your predicted outcome
4. Enter the amount you want to stake
5. Click "Place Prediction"

### Viewing Statistics

Each market displays:
- Total number of predictions
- Total amount staked
- Percentage distribution for each outcome
- Market status (open/closed/resolved)

## API Endpoints

- `GET /api/markets` - Get all markets
- `GET /api/markets/:id` - Get market details with statistics
- `POST /api/markets` - Create a new market
- `POST /api/predictions` - Place a prediction
- `GET /api/predictions/user/:userId` - Get user's predictions

## Testing

Run the test suite:

```bash
npm test
```

## Project Structure

```
-prediction-market/
├── prediction-market.js  # Core prediction market logic
├── server.js            # HTTP server and API endpoints
├── index.html           # Web interface
├── style.css            # Styling
├── app.js               # Client-side JavaScript
├── test.js              # Test suite
├── package.json         # Project configuration
└── README.md            # Documentation
```

## License

MIT