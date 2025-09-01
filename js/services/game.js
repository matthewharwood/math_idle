import { 
  loadGameState, 
  saveGameState, 
  createNewGameState, 
  clearGameState,
  swapCards 
} from './storage.js';
import { createRandomNumberGenerator } from '../utils/generate-random-numbers.js';
import { enemies } from '../data/enemies-generated.js';

class GameManager {
  constructor() {
    this.currentState = null;
    this.container = null;
    this.isInitialized = false;
    this.enemyComponent = null;
  }

  // Initialize the game
  async init() {
    if (this.isInitialized) return;
    
    console.log('Initializing game...');
    
    // Try to load existing game state
    this.currentState = await loadGameState();
    
    if (!this.currentState) {
      // No saved state, create new game with defaults
      console.log('Creating new game...');
      const cardCount = 5;
      const numberRange = 10;
      const numberGenerator = createRandomNumberGenerator(cardCount, 0, numberRange);
      const cardValues = numberGenerator();
      this.currentState = createNewGameState(cardValues, cardCount, numberRange);
      // Initialize enemy state
      this.initializeEnemy();
      await saveGameState(this.currentState);
    }
    
    this.isInitialized = true;
    return this.currentState;
  }

  // Start a new game
  async newGame(cardCount = null, numberRange = null) {
    console.log('Starting new game...');
    
    // Use provided values or current state values or defaults
    const count = cardCount || this.currentState?.cardCount || 5;
    const range = numberRange || this.currentState?.numberRange || 10;
    
    // Clear existing state
    await clearGameState();
    
    // Generate new card values with current difficulty
    const numberGenerator = createRandomNumberGenerator(count, 0, range);
    const cardValues = numberGenerator();
    this.currentState = createNewGameState(cardValues, count, range);
    
    // Initialize enemy for level 1
    this.initializeEnemy();
    
    // Save the new state
    await saveGameState(this.currentState);
    
    // Refresh the UI
    this.renderGame();
    
    return this.currentState;
  }

  // Update card positions after a swap
  async updateCardSwap(cardId1, cardId2) {
    if (!this.currentState) return;
    
    // Update the state with swapped cards
    this.currentState = swapCards(this.currentState, cardId1, cardId2);
    
    // Save to storage
    await saveGameState(this.currentState);
    
    console.log('Cards swapped:', cardId1, cardId2);
  }

  // Render the game UI
  renderGame() {
    if (!this.currentState) return;
    
    // Clear existing cards
    const container = document.querySelector('card-container');
    if (!container) return;
    
    // Remove all existing content
    container.innerHTML = '';
    
    // Sort cards by slot index
    const sortedCards = [...this.currentState.cards].sort((a, b) => a.slotIndex - b.slotIndex);
    
    // Create slots and cards based on game state
    sortedCards.forEach((cardData, index) => {
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
    
    // Re-initialize the container
    if (container.connectedCallback) {
      container.connectedCallback();
    }
  }

  // Get current game state
  getState() {
    return this.currentState;
  }

  // Update coins
  async updateCoins(amount) {
    if (!this.currentState) return;
    
    this.currentState.coins += amount;
    await saveGameState(this.currentState);
    
    console.log('Coins updated:', this.currentState.coins);
    return this.currentState.coins;
  }

  // Update level
  async updateLevel(level) {
    if (!this.currentState) return;
    
    this.currentState.level = level;
    await saveGameState(this.currentState);
    
    console.log('Level updated:', this.currentState.level);
    return this.currentState.level;
  }
  
  // Increment level
  async incrementLevel() {
    if (!this.currentState) return;
    
    this.currentState.level += 1;
    await saveGameState(this.currentState);
    
    console.log('Level incremented to:', this.currentState.level);
    return this.currentState.level;
  }
  
  // Handle winning condition (now deals damage to enemy)
  async handleWin() {
    if (!this.currentState) return;
    
    // Calculate damage from card values
    const cardValues = this.getCardsInOrder().map(c => c.value);
    const totalDamage = cardValues.reduce((sum, value) => sum + value, 0);
    
    // Deal damage to enemy via enemy component
    let enemyDefeated = false;
    if (this.enemyComponent && this.currentState.enemy) {
      enemyDefeated = await this.enemyComponent.takeDamage(totalDamage);
      
      // Update game state with new enemy health
      this.currentState.enemy.currentHealth = this.enemyComponent.currentHealth;
      
      // Save the updated health immediately to persist it
      await saveGameState(this.currentState);
    }
    
    let levelIncreased = false;
    if (enemyDefeated) {
      // Enemy defeated - level up and get new enemy
      await this.incrementLevel();
      this.initializeEnemyForLevel(this.currentState.level);
      levelIncreased = true;
      
      // Update enemy component with new enemy and animation
      if (this.enemyComponent) {
        await this.enemyComponent.setLevel(this.currentState.level, true);
      }
    }
    
    // Generate new cards after card animation completes
    setTimeout(async () => {
      const cardCount = this.currentState.cardCount || 5;
      const numberRange = this.currentState.numberRange || 10;
      const numberGenerator = createRandomNumberGenerator(cardCount, 0, numberRange);
      const cardValues = numberGenerator();
      
      // Preserve current game state
      const currentCoins = this.currentState.coins;
      const currentLevel = this.currentState.level;
      const currentEnemy = this.currentState.enemy;
      
      this.currentState = createNewGameState(cardValues, cardCount, numberRange);
      this.currentState.coins = currentCoins;
      this.currentState.level = currentLevel;
      this.currentState.enemy = currentEnemy;
      
      await saveGameState(this.currentState);
      
      // Trigger UI update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gameStateUpdated', {
          detail: this.currentState
        }));
      }
    }, 400);
    
    return { 
      damage: totalDamage, 
      enemyDefeated, 
      levelIncreased 
    };
  }

  // Get card by ID
  getCard(cardId) {
    if (!this.currentState) return null;
    return this.currentState.cards.find(c => c.id === cardId);
  }

  // Get cards in order
  getCardsInOrder() {
    if (!this.currentState) return [];
    return [...this.currentState.cards].sort((a, b) => a.slotIndex - b.slotIndex);
  }
  
  // Update difficulty settings
  async updateDifficulty(cardCount, numberRange) {
    if (!this.currentState) return;
    
    // Store current coins and level
    const currentCoins = this.currentState.coins;
    const currentLevel = this.currentState.level;
    
    // Generate new cards with new difficulty
    const numberGenerator = createRandomNumberGenerator(cardCount, 0, numberRange);
    const cardValues = numberGenerator();
    
    this.currentState = createNewGameState(cardValues, cardCount, numberRange);
    this.currentState.coins = currentCoins; // Preserve coins
    this.currentState.level = currentLevel; // Preserve level
    
    await saveGameState(this.currentState);
    
    // Trigger UI update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gameStateUpdated', {
        detail: this.currentState
      }));
    }
    
    return this.currentState;
  }

  // Enemy management methods
  
  /**
   * Get enemy by level from generated data
   */
  getEnemyByLevel(level) {
    // First try to find exact match
    let enemy = enemies.find(e => e.level === level);
    
    // If no exact match, find the closest lower level enemy
    if (!enemy) {
      const lowerEnemies = enemies.filter(e => e.level <= level);
      if (lowerEnemies.length > 0) {
        enemy = lowerEnemies[lowerEnemies.length - 1];
      } else {
        // Default to first enemy if level is too low
        enemy = enemies[0];
      }
    }
    
    return enemy;
  }

  /**
   * Initialize enemy for current level
   */
  initializeEnemy() {
    if (!this.currentState) return;
    
    const enemy = this.getEnemyByLevel(this.currentState.level);
    if (!enemy) {
      console.error(`No enemy found for level ${this.currentState.level}`);
      return;
    }
    
    this.currentState.enemy = {
      enemy: { ...enemy },
      currentHealth: enemy.health
    };
    
    console.log(`Initialized enemy: ${enemy.name} (Level ${enemy.level}) for player level ${this.currentState.level}`);
  }

  /**
   * Initialize enemy for specific level (used after level up)
   */
  initializeEnemyForLevel(level) {
    if (!this.currentState) return;
    
    // Find the next available enemy at or above this level
    const availableEnemy = this.getNextAvailableEnemy(level);
    if (!availableEnemy) return;
    
    this.currentState.enemy = {
      enemy: { ...availableEnemy },
      currentHealth: availableEnemy.health
    };
    
    console.log(`New enemy for level ${level}: ${availableEnemy.name} (Level ${availableEnemy.level})`);
  }

  /**
   * Get next available enemy at or above the given level
   */
  getNextAvailableEnemy(level) {
    // Find the next enemy that has level >= player level
    const availableEnemies = enemies.filter(e => e.level >= level);
    
    if (availableEnemies.length === 0) {
      // If no enemies at or above level, get the highest level enemy
      return enemies[enemies.length - 1];
    }
    
    // Return the enemy with the lowest level that's still >= player level
    return availableEnemies.reduce((closest, current) => 
      current.level < closest.level ? current : closest
    );
  }

  /**
   * Handle enemy defeat (called when enemy reaches 0 health)
   */
  handleEnemyDefeat() {
    if (!this.currentState?.enemy) return;
    
    const reward = this.currentState.enemy.enemy.reward;
    this.currentState.coins += reward;
    console.log(`Enemy defeated! Earned ${reward} coins`);
  }

  /**
   * Set enemy component reference
   */
  setEnemyComponent(component) {
    this.enemyComponent = component;
  }

  /**
   * Update enemy component display
   */
  updateEnemyComponent() {
    if (this.enemyComponent && this.currentState?.enemy) {
      // Only update if the enemy data has changed
      const componentEnemy = this.enemyComponent.currentEnemy;
      const stateEnemy = this.currentState.enemy.enemy;
      
      if (!componentEnemy || componentEnemy.level !== stateEnemy.level) {
        this.enemyComponent.setState(this.currentState.enemy);
      } else {
        // Same enemy, just sync health
        this.enemyComponent.currentHealth = this.currentState.enemy.currentHealth;
        this.enemyComponent.updateDisplay();
      }
    }
  }

  /**
   * Get current enemy state
   */
  getCurrentEnemy() {
    return this.currentState?.enemy || null;
  }

  /**
   * Save current game state
   */
  async saveGameState() {
    if (this.currentState) {
      await saveGameState(this.currentState);
    }
  }
}

// Create and export a singleton instance
export const gameManager = new GameManager();

// Export for convenience
export default gameManager;