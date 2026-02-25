const http = require('http');
const fs = require('fs');
const path = require('path');
const PredictionMarket = require('./prediction-market');

// Initialize the prediction market
const market = new PredictionMarket();

// Create some sample markets
market.createMarket(
  "Will it rain tomorrow?",
  new Date(Date.now() + 24 * 60 * 60 * 1000),
  ["Yes", "No"]
);

market.createMarket(
  "Will the stock market go up this week?",
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  ["Up", "Down", "Unchanged"]
);

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Handle API endpoints
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }

  // Serve static files
  if (req.url === '/' || req.url === '/index.html') {
    serveFile(res, 'index.html', 'text/html');
  } else if (req.url === '/style.css') {
    serveFile(res, 'style.css', 'text/css');
  } else if (req.url === '/app.js') {
    serveFile(res, 'app.js', 'application/javascript');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

function serveFile(res, filename, contentType) {
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function handleApiRequest(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // GET /api/markets - Get all markets
      if (req.url === '/api/markets' && req.method === 'GET') {
        const markets = market.getAllMarkets();
        sendJson(res, markets);
      }
      // GET /api/markets/:id - Get market details
      else if (req.url.match(/^\/api\/markets\/\d+$/) && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[3]);
        const marketData = market.getMarket(id);
        if (marketData) {
          const stats = market.getMarketStats(id);
          sendJson(res, { ...marketData, stats });
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Market not found' }));
        }
      }
      // POST /api/markets - Create a new market
      else if (req.url === '/api/markets' && req.method === 'POST') {
        const data = JSON.parse(body);
        const newMarket = market.createMarket(
          data.question,
          data.closeDate,
          data.outcomes
        );
        sendJson(res, newMarket, 201);
      }
      // POST /api/predictions - Place a prediction
      else if (req.url === '/api/predictions' && req.method === 'POST') {
        const data = JSON.parse(body);
        const prediction = market.placePrediction(
          data.marketId,
          data.userId,
          data.outcome,
          data.amount
        );
        sendJson(res, prediction, 201);
      }
      // GET /api/predictions/user/:userId - Get user predictions
      else if (req.url.match(/^\/api\/predictions\/user\/.+$/) && req.method === 'GET') {
        const userId = req.url.split('/')[4];
        const predictions = market.getPredictionsForUser(userId);
        sendJson(res, predictions);
      }
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

server.listen(PORT, () => {
  console.log(`Prediction Market server running on http://localhost:${PORT}`);
  console.log('Sample markets have been created!');
});
