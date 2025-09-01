// Register Web Components
import './components/Card.js';
import './components/CardSlot.js';
import './components/CardContainer.js';
import './components/SettingsButton.js';
import './components/SideDrawer.js';
import './components/GameButton.js';
import './components/ThemeButton.js';
import './components/DifficultyControl.js';
import './components/RangeControl.js';
import './components/Enemy.js';

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
    
    // Update coins display
    updateCoinsDisplay(gameState);
    
    // Initialize enemy system
    initializeEnemySystem(gameState);
    
    // Set up event listeners for card swaps
    setupCardSwapListeners();
    
    // Set up difficulty controls
    setupDifficultyControls(gameState);
    
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
    
    // Handle win (deals damage to enemy)
    const result = await gameManager.handleWin();
    
    // Update coins and level display
    const currentState = gameManager.getState();
    updateCoinsDisplay(currentState);
    
    // Save game state after damage/defeat
    await gameManager.saveGameState(currentState);
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
          updateCoinsDisplay(newState);
          updateDifficultyControls(newState);
          initializeEnemySystem(newState);
        }
      }
    });
  }
}

// Set up difficulty controls
function setupDifficultyControls(gameState) {
  const difficultyControl = document.querySelector('difficulty-control');
  const rangeControl = document.querySelector('range-control');
  
  if (difficultyControl) {
    // Set initial value
    difficultyControl.setAttribute('value', gameState?.cardCount || 5);
    
    // Listen for changes
    difficultyControl.addEventListener('difficulty-changed', async (event) => {
      const cardCount = event.detail.value;
      const currentRange = rangeControl?.value || gameState?.numberRange || 10;
      
      const updatedState = await gameManager.updateDifficulty(cardCount, currentRange);
      updateUIFromGameState(updatedState);
      updateCoinsDisplay(updatedState);
    });
  }
  
  if (rangeControl) {
    // Set initial value
    rangeControl.setAttribute('value', gameState?.numberRange || 10);
    
    // Listen for changes
    rangeControl.addEventListener('range-changed', async (event) => {
      const numberRange = event.detail.value;
      const currentCount = difficultyControl?.value || gameState?.cardCount || 5;
      
      const updatedState = await gameManager.updateDifficulty(currentCount, numberRange);
      updateUIFromGameState(updatedState);
      updateCoinsDisplay(updatedState);
    });
  }
}

// Update difficulty controls display
function updateDifficultyControls(gameState) {
  const difficultyControl = document.querySelector('difficulty-control');
  const rangeControl = document.querySelector('range-control');
  
  if (difficultyControl && gameState?.cardCount) {
    difficultyControl.setAttribute('value', gameState.cardCount);
  }
  
  if (rangeControl && gameState?.numberRange) {
    rangeControl.setAttribute('value', gameState.numberRange);
  }
}

// Initialize enemy system
function initializeEnemySystem(gameState) {
  const enemyComponent = document.querySelector('game-enemy');
  if (!enemyComponent) return;
  
  // Set the game manager reference
  gameManager.setEnemyComponent(enemyComponent);
  
  // Initialize enemy if not already done
  if (!gameState.enemy) {
    gameManager.initializeEnemy();
    gameManager.updateEnemyComponent();
  } else {
    // Restore enemy state with current health
    enemyComponent.setState(gameState.enemy);
    console.log(`Restored enemy: ${gameState.enemy.enemy.name} with ${gameState.enemy.currentHealth}/${gameState.enemy.enemy.health} HP`);
  }
  
  // Set enemy level (but don't animate on initial load)
  enemyComponent.setLevel(gameState.level, false);
  
  // Listen for enemy defeat events
  enemyComponent.addEventListener('enemy-defeated', async (event) => {
    const { reward } = event.detail;
    console.log(`Enemy defeated! Earned ${reward} reward points`);
    
    // Handle the reward in game manager
    gameManager.handleEnemyDefeat();
  });
  
  console.log('Enemy system initialized');
}

// Update enemy display
function updateEnemyDisplay(enemyState, battleResult) {
  const enemyComponent = document.querySelector('game-enemy');
  if (!enemyComponent || !enemyState) return;
  
  // Update enemy state
  enemyComponent.setState(enemyState);
  
  // Show damage feedback
  if (battleResult?.damage) {
    console.log(`Dealt ${battleResult.damage} damage!`);
    // Could add visual damage feedback here
  }
  
  // Handle enemy defeat
  if (battleResult?.enemyDefeated) {
    console.log('Enemy defeated!');
    // Could add victory celebration here
  }
  
  // Handle level up
  if (battleResult?.levelIncreased) {
    console.log('Level up!');
    const currentState = gameManager.getState();
    enemyComponent.setLevel(currentState.level);
  }
}

// Update coins and level display
function updateCoinsDisplay(gameState) {
  if (!gameState) return;
  
  const coinsEl = document.getElementById('coins');
  const levelEl = document.getElementById('level');
  const drawerCoinsEl = document.getElementById('drawer-coins');
  const drawerLevelEl = document.getElementById('drawer-level');
  
  if (coinsEl) coinsEl.textContent = gameState.coins || 0;
  if (levelEl) levelEl.textContent = gameState.level || 1;
  if (drawerCoinsEl) drawerCoinsEl.textContent = gameState.coins || 0;
  if (drawerLevelEl) drawerLevelEl.textContent = gameState.level || 1;
}

// Listen for coin animation completion to trigger incremental counting
window.addEventListener('coinsAnimationComplete', () => {
  const currentState = gameManager.getState();
  if (currentState) {
    animateCoinsIncrement(currentState.coins);
  }
});

// Animate coin count incrementally
function animateCoinsIncrement(targetCoins) {
  const coinsEl = document.getElementById('coins');
  const drawerCoinsEl = document.getElementById('drawer-coins');
  
  if (!coinsEl && !drawerCoinsEl) return;
  
  const startCoins = parseInt(coinsEl?.textContent || drawerCoinsEl?.textContent || '0');
  const coinDiff = targetCoins - startCoins;
  
  if (coinDiff <= 0) return; // No change needed
  
  const duration = Math.min(1000, Math.max(300, coinDiff * 20)); // 20ms per coin, min 300ms, max 1s
  const steps = Math.min(coinDiff, 50); // Max 50 steps for smooth animation
  const increment = coinDiff / steps;
  const stepDuration = duration / steps;
  
  let currentStep = 0;
  
  const animate = () => {
    currentStep++;
    const currentValue = Math.floor(startCoins + (increment * currentStep));
    const displayValue = Math.min(currentValue, targetCoins);
    
    if (coinsEl) coinsEl.textContent = displayValue;
    if (drawerCoinsEl) drawerCoinsEl.textContent = displayValue;
    
    // Add pulse effect on the coin display
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
      coinsDisplay.style.transform = 'scale(1.1)';
      coinsDisplay.style.transition = 'transform 0.1s ease';
      setTimeout(() => {
        coinsDisplay.style.transform = 'scale(1)';
      }, 100);
    }
    
    if (currentStep < steps && displayValue < targetCoins) {
      setTimeout(animate, stepDuration);
    }
  };
  
  animate();
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
  updateCoinsDisplay(gameState);
  updateDifficultyControls(gameState);
  
  // Update enemy display
  const enemyComponent = document.querySelector('game-enemy');
  if (enemyComponent && gameState.enemy) {
    // Set level first, then restore state to preserve health
    enemyComponent.setLevel(gameState.level, false);
    enemyComponent.setState(gameState.enemy);
  }
  
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