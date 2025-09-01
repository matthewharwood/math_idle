import { openDB, deleteDB } from 'idb';

const DB_NAME = 'MathIdleGame';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';

// Initialize the database
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create the game state store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// Game state object structure
export const Game = {
  cards: [],        // Array of card objects with {id, value, slotIndex}
  score: 0,         // Current game score
  level: 1,         // Current game level
  cardCount: 5,     // Number of cards (difficulty)
  numberRange: 10,  // Maximum number range
  timestamp: null,  // Last save timestamp
};

// Save game state to IndexedDB
export async function saveGameState(gameState) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    // Add timestamp to the game state
    const stateToSave = {
      ...gameState,
      timestamp: Date.now()
    };
    
    await store.put(stateToSave, 'currentGame');
    await tx.complete;
    
    console.log('Game state saved:', stateToSave);
    return true;
  } catch (error) {
    console.error('Error saving game state:', error);
    return false;
  }
}

// Load game state from IndexedDB
export async function loadGameState() {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const gameState = await store.get('currentGame');
    
    if (gameState) {
      console.log('Game state loaded:', gameState);
      return gameState;
    }
    
    console.log('No saved game state found');
    return null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

// Clear game state
export async function clearGameState() {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.delete('currentGame');
    await tx.complete;
    
    console.log('Game state cleared');
    return true;
  } catch (error) {
    console.error('Error clearing game state:', error);
    return false;
  }
}

// Delete the entire database
export async function deleteGameDatabase() {
  try {
    await deleteDB(DB_NAME);
    console.log('Game database deleted');
    return true;
  } catch (error) {
    console.error('Error deleting database:', error);
    return false;
  }
}

// Helper function to create a new game state
export function createNewGameState(cardValues, cardCount = 5, numberRange = 10) {
  return {
    cards: cardValues.map((value, index) => ({
      id: `card-${index + 1}`,
      value: value,
      slotIndex: index,
      originalIndex: index
    })),
    score: 0,
    level: 1,
    cardCount: cardCount,
    numberRange: numberRange,
    timestamp: Date.now()
  };
}

// Helper function to update card positions in game state
export function updateCardPositions(gameState, cardId, newSlotIndex) {
  const updatedCards = gameState.cards.map(card => {
    if (card.id === cardId) {
      return { ...card, slotIndex: newSlotIndex };
    }
    return card;
  });
  
  return {
    ...gameState,
    cards: updatedCards,
    timestamp: Date.now()
  };
}

// Helper function to swap two cards in game state
export function swapCards(gameState, cardId1, cardId2) {
  const card1 = gameState.cards.find(c => c.id === cardId1);
  const card2 = gameState.cards.find(c => c.id === cardId2);
  
  if (!card1 || !card2) return gameState;
  
  const updatedCards = gameState.cards.map(card => {
    if (card.id === cardId1) {
      return { ...card, slotIndex: card2.slotIndex };
    }
    if (card.id === cardId2) {
      return { ...card, slotIndex: card1.slotIndex };
    }
    return card;
  });
  
  return {
    ...gameState,
    cards: updatedCards,
    timestamp: Date.now()
  };
}