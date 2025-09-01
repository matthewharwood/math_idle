import { 
  loadGameState, 
  saveGameState, 
  createNewGameState, 
  clearGameState,
  swapCards 
} from './storage.js';
import { fiveNumberGenerator } from '../utils/generate-random-numbers.js';

class GameManager {
  constructor() {
    this.currentState = null;
    this.container = null;
    this.isInitialized = false;
  }

  // Initialize the game
  async init() {
    if (this.isInitialized) return;
    
    console.log('Initializing game...');
    
    // Try to load existing game state
    this.currentState = await loadGameState();
    
    if (!this.currentState) {
      // No saved state, create new game
      console.log('Creating new game...');
      const cardValues = fiveNumberGenerator();
      this.currentState = createNewGameState(cardValues);
      await saveGameState(this.currentState);
    }
    
    this.isInitialized = true;
    return this.currentState;
  }

  // Start a new game
  async newGame() {
    console.log('Starting new game...');
    
    // Clear existing state
    await clearGameState();
    
    // Generate new card values
    const cardValues = fiveNumberGenerator();
    this.currentState = createNewGameState(cardValues);
    
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

  // Update score
  async updateScore(points) {
    if (!this.currentState) return;
    
    this.currentState.score += points;
    await saveGameState(this.currentState);
    
    console.log('Score updated:', this.currentState.score);
  }

  // Update level
  async updateLevel(level) {
    if (!this.currentState) return;
    
    this.currentState.level = level;
    await saveGameState(this.currentState);
    
    console.log('Level updated:', this.currentState.level);
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
}

// Create and export a singleton instance
export const gameManager = new GameManager();

// Export for convenience
export default gameManager;