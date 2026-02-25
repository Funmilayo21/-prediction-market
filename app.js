// Prediction Market Client-Side Application

let currentMarkets = [];

// Load markets on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMarkets();
    setupEventListeners();
    setMinDateTime();
});

function setMinDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('closeDate').min = now.toISOString().slice(0, 16);
}

function setupEventListeners() {
    // Create market form
    document.getElementById('create-market-form').addEventListener('submit', handleCreateMarket);
    
    // Prediction form
    document.getElementById('prediction-form').addEventListener('submit', handlePlacePrediction);
    
    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.id === 'prediction-modal') {
            closeModal();
        }
    });
}

async function loadMarkets() {
    try {
        const response = await fetch('/api/markets');
        const markets = await response.json();
        currentMarkets = markets;
        displayMarkets(markets);
    } catch (error) {
        showError('Failed to load markets: ' + error.message);
    }
}

async function displayMarkets(markets) {
    const container = document.getElementById('markets-list');
    
    if (markets.length === 0) {
        container.innerHTML = '<p class="loading">No markets available. Create one below!</p>';
        return;
    }

    container.innerHTML = '';
    
    for (const market of markets) {
        try {
            const response = await fetch(`/api/markets/${market.id}`);
            const marketData = await response.json();
            const card = createMarketCard(marketData);
            container.appendChild(card);
        } catch (error) {
            console.error('Failed to load market details:', error);
        }
    }
}

function createMarketCard(marketData) {
    const card = document.createElement('div');
    card.className = 'market-card';
    
    const closeDate = new Date(marketData.closeDate);
    const isOpen = marketData.status === 'open' && new Date() < closeDate;
    
    let statsHtml = '';
    if (marketData.stats && marketData.stats.totalPredictions > 0) {
        statsHtml = '<div class="market-stats">';
        statsHtml += `<p><strong>Total Predictions:</strong> ${marketData.stats.totalPredictions} (Amount: ${marketData.stats.totalAmount})</p>`;
        
        for (const outcome of marketData.outcomes) {
            const stat = marketData.stats.outcomeStats[outcome];
            statsHtml += `
                <div class="outcome-stat">
                    <span class="outcome-name">${outcome}</span>
                    <span class="outcome-percentage">${stat.percentage}% (${stat.amount})</span>
                </div>
            `;
        }
        statsHtml += '</div>';
    }
    
    card.innerHTML = `
        <div class="market-question">${marketData.question}</div>
        <div class="market-info">
            <span class="market-status ${marketData.status}">${marketData.status.toUpperCase()}</span>
            <span class="market-close-date">Closes: ${closeDate.toLocaleString()}</span>
        </div>
        ${statsHtml}
        ${isOpen ? `<button class="btn btn-secondary" onclick="openPredictionModal(${marketData.id})">Make Prediction</button>` : ''}
        ${marketData.status === 'resolved' ? `<p><strong>Winner:</strong> ${marketData.resolvedOutcome}</p>` : ''}
    `;
    
    return card;
}

function openPredictionModal(marketId) {
    const market = currentMarkets.find(m => m.id === marketId);
    if (!market) return;
    
    document.getElementById('modal-market-id').value = marketId;
    document.getElementById('modal-market-question').textContent = market.question;
    
    const outcomeSelect = document.getElementById('outcome');
    outcomeSelect.innerHTML = '';
    market.outcomes.forEach(outcome => {
        const option = document.createElement('option');
        option.value = outcome;
        option.textContent = outcome;
        outcomeSelect.appendChild(option);
    });
    
    document.getElementById('prediction-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('prediction-modal').style.display = 'none';
    document.getElementById('prediction-form').reset();
}

async function handleCreateMarket(e) {
    e.preventDefault();
    
    const question = document.getElementById('question').value;
    const closeDate = document.getElementById('closeDate').value;
    const outcomesStr = document.getElementById('outcomes').value;
    const outcomes = outcomesStr.split(',').map(s => s.trim()).filter(s => s);
    
    try {
        const response = await fetch('/api/markets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question,
                closeDate,
                outcomes
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create market');
        }
        
        showSuccess('Market created successfully!');
        document.getElementById('create-market-form').reset();
        setMinDateTime();
        await loadMarkets();
    } catch (error) {
        showError('Failed to create market: ' + error.message);
    }
}

async function handlePlacePrediction(e) {
    e.preventDefault();
    
    const marketId = parseInt(document.getElementById('modal-market-id').value);
    const userId = document.getElementById('userId').value;
    const outcome = document.getElementById('outcome').value;
    const amount = parseInt(document.getElementById('amount').value);
    
    try {
        const response = await fetch('/api/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                marketId,
                userId,
                outcome,
                amount
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to place prediction');
        }
        
        showSuccess('Prediction placed successfully!');
        closeModal();
        await loadMarkets();
    } catch (error) {
        showError('Failed to place prediction: ' + error.message);
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.querySelector('.container').insertBefore(errorDiv, document.querySelector('main'));
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    document.querySelector('.container').insertBefore(successDiv, document.querySelector('main'));
    setTimeout(() => successDiv.remove(), 5000);
}
