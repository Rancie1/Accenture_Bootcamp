/**
 * LocalStorage utility functions for persisting app state
 * Requirements: 13.6
 */

const STORAGE_KEY = 'koko-app-state';

/**
 * Save app state to localStorage
 * Handles errors gracefully
 * @param {Object} state - App state to save
 * @returns {boolean} Success status
 */
export const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Please clear some data.');
    }
    return false;
  }
};

/**
 * Load app state from localStorage
 * Returns null if no state exists or on error
 * @returns {Object|null} Loaded state or null
 */
export const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

/**
 * Clear all app state from localStorage
 * @returns {boolean} Success status
 */
export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
    return false;
  }
};
