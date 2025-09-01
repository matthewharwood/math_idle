// Register Web Components
import './components/Card.js';
import './components/CardSlot.js';
import './components/CardContainer.js';
import './components/SettingsButton.js';
import './components/SideDrawer.js';
import './components/GameButton.js';
import './components/ThemeButton.js';

// Import services
import gameManager from './services/game.js';
import { initializeTheme } from './services/theme.js';

// Initialize game when DOM is ready
async function initializeGame() {
  try {
    // Initialize theme first
    await initializeTheme();
    
    // Initialize the game state
    const gameState = await gameManager.init();
    
    // Update the UI with the game state
    updateUIFromGameState(gameState);
    
    // Update score display
    updateScoreDisplay(gameState);
    
    // Set up event listeners for card swaps
    setupCardSwapListeners();
    
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
}

// Update UI based on game state
function updateUIFromGameState(gameState) {
  if (!gameState || !gameState.cards) return;
  
  const container = document.querySelector('card-container');
  if (!container) return;
  
  // Clear existing cards
  container.innerHTML = '';
  
  // Sort cards by slot index
  const sortedCards = [...gameState.cards].sort((a, b) => a.slotIndex - b.slotIndex);
  
  // Create slots and cards
  sortedCards.forEach((cardData) => {
    // Create slot
    const slot = document.createElement('card-slot');
    
    // Create card with value
    const card = document.createElement('card-element');
    card.id = cardData.id;
    card.setAttribute('label', cardData.value.toString());
    card.setAttribute('card-type', 'default');
    card.setAttribute('data-value', cardData.value);
    card.setAttribute('data-original-index', cardData.originalIndex);
    
    // Add card to slot
    slot.appendChild(card);
    container.appendChild(slot);
  });
  
  // Set sort order attribute
  container.setAttribute('sort-order', 'ASC');
  
  // Trigger container initialization
  requestAnimationFrame(() => {
    if (container.connectedCallback) {
      container.connectedCallback();
    }
    
    // If this is a refresh after winning, animate the new cards
    if (container.hasAttribute('winning')) {
      container.removeAttribute('winning');
      setTimeout(() => {
        container.animateNewCards();
      }, 100);
    }
  });
}

// Set up listeners for card swap events
function setupCardSwapListeners() {
  const container = document.querySelector('card-container');
  if (!container) return;
  
  // Listen for custom swap event from CardContainer
  container.addEventListener('cardSwapped', async (event) => {
    const { card1Id, card2Id } = event.detail;
    await gameManager.updateCardSwap(card1Id, card2Id);
  });
  
  // Listen for card move event
  container.addEventListener('cardMoved', async (event) => {
    const { cardId, fromSlot, toSlot } = event.detail;
    console.log(`Card ${cardId} moved from slot ${fromSlot} to slot ${toSlot}`);
    // Could add additional game logic here
  });
  
  // Listen for winning event
  container.addEventListener('containerWon', async (event) => {
    const { values, sortOrder } = event.detail;
    console.log(`Container won! Order: ${sortOrder}, Values: ${values}`);
    
    // Update score and level
    const result = await gameManager.handleWin();
    updateScoreDisplay({ score: result.score, level: result.level });
  });
  
  // Set up new game button (now a web component)
  const newGameBtn = document.querySelector('game-button[action="new-game"]');
  if (newGameBtn) {
    newGameBtn.addEventListener('game-action', async (event) => {
      if (event.detail.action === 'new-game') {
        if (confirm('Start a new game? Current progress will be lost.')) {
          await gameManager.newGame();
          const newState = gameManager.getState();
          updateUIFromGameState(newState);
          updateScoreDisplay(newState);
        }
      }
    });
  }
}

// Update score and level display
function updateScoreDisplay(gameState) {
  if (!gameState) return;
  
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const drawerScoreEl = document.getElementById('drawer-score');
  const drawerLevelEl = document.getElementById('drawer-level');
  
  if (scoreEl) scoreEl.textContent = gameState.score || 0;
  if (levelEl) levelEl.textContent = gameState.level || 1;
  if (drawerScoreEl) drawerScoreEl.textContent = gameState.score || 0;
  if (drawerLevelEl) drawerLevelEl.textContent = gameState.level || 1;
}

// Listen for game state updates
window.addEventListener('gameStateUpdated', (event) => {
  const gameState = event.detail;
  const container = document.querySelector('card-container');
  
  // Clear winning state before update
  if (container && container.hasAttribute('winning')) {
    container.removeAttribute('winning');
  }
  
  updateUIFromGameState(gameState);
  updateScoreDisplay(gameState);
  
  // Animate new cards entering
  if (container && container.animateNewCards) {
    setTimeout(() => {
      container.animateNewCards();
    }, 50);
  }
});

// Wait for DOM and components to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  // DOM is already loaded
  setTimeout(initializeGame, 100); // Small delay to ensure components are registered
}