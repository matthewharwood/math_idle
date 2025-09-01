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
    const { values, sortOrder, containerElement } = event.detail;
    console.log(`Container won! Order: ${sortOrder}, Values: ${values}`);
    
    // Start coin animation immediately
    animateCoinsToToolbar(values, containerElement);
    
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
    // Set enemy level (but don't animate on initial load)
    enemyComponent.setLevel(gameState.level, false);
  } else {
    // Restore enemy state with current health (setState handles level setting internally)
    enemyComponent.setState(gameState.enemy);
    console.log(`Restored enemy: ${gameState.enemy.enemy.name} with ${gameState.enemy.currentHealth}/${gameState.enemy.enemy.health} HP`);
  }
  
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

// Coin animation functions (moved from CardContainer to avoid clipping issues)
function animateCoinsToToolbar(values, containerElement) {
  // Calculate total coins earned from card values
  const totalCoins = values.reduce((sum, value) => sum + value, 0);
  const coinCount = Math.min(8, Math.max(3, Math.floor(totalCoins / 5))); // 3-8 coins based on total
  
  // Get positions
  const containerRect = containerElement.getBoundingClientRect();
  let coinsDisplay = document.getElementById('coins-display');
  
  // If coins-display not found, try targeting the coins element directly
  if (!coinsDisplay) {
    coinsDisplay = document.getElementById('coins');
    if (!coinsDisplay) {
      console.error('Neither coins-display nor coins element found!');
      return;
    }
  }
  
  const targetRect = coinsDisplay.getBoundingClientRect();
  
  // Log the target element for debugging
  console.log('Target element:', coinsDisplay.id, 'at position:', targetRect);
  
  // Calculate center points
  const startX = containerRect.left + containerRect.width / 2;
  const startY = containerRect.top + containerRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;
  
  console.log(`Coin animation: from (${startX}, ${startY}) to (${endX}, ${endY})`);
  
  // Create and animate coins
  for (let i = 0; i < coinCount; i++) {
    setTimeout(() => {
      createAnimatedCoin(startX, startY, endX, endY, i);
    }, i * 100); // Stagger coin creation
  }
}

function createAnimatedCoin(startX, startY, endX, endY, index) {
  // Create coin element
  const coin = document.createElement('div');
  coin.className = 'animated-coin';
  coin.textContent = '🪙';
  
  // Add random spread at start but constrain to viewport
  const spread = 40;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate random spread but clamp within viewport bounds
  const randomOffsetX = (Math.random() - 0.5) * spread;
  const randomOffsetY = (Math.random() - 0.5) * spread;
  
  const randomX = Math.max(50, Math.min(viewportWidth - 50, startX + randomOffsetX));
  const randomY = Math.max(50, Math.min(viewportHeight - 50, startY + randomOffsetY));
  
  coin.style.cssText = `
    position: fixed;
    font-size: 24px;
    pointer-events: none;
    z-index: 99999;
    left: ${randomX}px;
    top: ${randomY}px;
    transform: translate(-50%, -50%);
    opacity: 1;
  `;
  
  // Append directly to document body to ensure no clipping
  document.body.appendChild(coin);
  console.log(`Created coin at (${randomX}, ${randomY}), animating to (${endX}, ${endY})`);
  
  // Add floating animation first
  coin.style.animation = 'coinFloat 0.2s ease-out';
  
  // Start the main animation after floating animation completes
  setTimeout(() => {
    // Apply the transition for smooth movement
    coin.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    coin.style.left = `${endX}px`;
    coin.style.top = `${endY}px`;
    coin.style.transform = 'translate(-50%, -50%) scale(1.2)';
  }, 200);
  
  // Scale down and fade out AFTER reaching destination
  setTimeout(() => {
    coin.style.transition = 'all 0.3s ease-in';
    coin.style.transform = 'translate(-50%, -50%) scale(0.5)';
    coin.style.opacity = '0';
  }, 1200); // Wait for travel animation to complete
  
  // Remove coin after fade animation
  setTimeout(() => {
    if (coin.parentNode) {
      coin.parentNode.removeChild(coin);
    }
    
    // Trigger coin count animation on last coin
    if (index === 0) {
      triggerCoinCountUpdate();
    }
  }, 1500); // Total: 1200ms travel + 300ms fade
}

function triggerCoinCountUpdate() {
  // Dispatch custom event to trigger incremental counting
  window.dispatchEvent(new CustomEvent('coinsAnimationComplete'));
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