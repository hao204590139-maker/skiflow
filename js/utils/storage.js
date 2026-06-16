/**
 * localStorage wrapper with JSON serialization and error handling.
 */

const STORAGE_PREFIX = 'ski-academy-';

/**
 * Get a value from localStorage.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Set a value in localStorage.
 * @param {string} key
 * @param {*} value
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Remove a value from localStorage.
 * @param {string} key
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // silently fail
  }
}

/**
 * Get all stored keys (for debugging).
 * @returns {string[]}
 */
export function getAllKeys() {
  try {
    return Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .map(k => k.slice(STORAGE_PREFIX.length));
  } catch {
    return [];
  }
}
