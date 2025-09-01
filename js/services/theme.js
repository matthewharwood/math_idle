import { openDB } from 'idb';

const DB_NAME = 'MathIdleTheme';
const DB_VERSION = 1;
const STORE_NAME = 'theme';

// Initialize the theme database
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function getTheme() {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const theme = await store.get('currentTheme');
    return theme || 'dark'; // Default to dark theme
  } catch (error) {
    console.error('Error getting theme:', error);
    return 'dark';
  }
}

export async function setTheme(theme) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(theme, 'currentTheme');
    await tx.complete;
    
    document.documentElement.setAttribute('data-theme', theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme },
      bubbles: true
    }));
    
    return true;
  } catch (error) {
    console.error('Error setting theme:', error);
    return false;
  }
}

export async function initializeTheme() {
  const theme = await getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

export async function toggleTheme() {
  const currentTheme = await getTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  await setTheme(newTheme);
  return newTheme;
}