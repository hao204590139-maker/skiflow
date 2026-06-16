/**
 * Simple pub/sub state management.
 */

import { getItem, setItem } from './utils/storage.js';

/**
 * @typedef {Object} AppState
 * @property {string} currentView - 'home' | 'chapter' | 'roadmap' | 'appendix'
 * @property {string|null} currentChapterId - e.g. 'ski-1-1'
 * @property {'ski'|'snowboard'} track - current learning track
 * @property {string[]} completedChapters - Array of completed chapter IDs
 * @property {'light'|'dark'} theme
 * @property {boolean} sidebarOpen - Mobile sidebar toggle
 */

/** @type {AppState} */
const state = {
  currentView: 'home',
  currentChapterId: null,
  track: getItem('track', 'ski'),
  completedChapters: getItem('completed-chapters', []),
  theme: getItem('theme', 'light'),
  sidebarOpen: false,
};

/** @type {Map<string, Function[]>} */
const listeners = new Map();

/**
 * Get current state (read-only snapshot).
 * @returns {Readonly<AppState>}
 */
export function getState() {
  return state;
}

/**
 * Update state partially and notify listeners.
 * @param {Partial<AppState>} updates
 */
export function setState(updates) {
  const changedKeys = [];

  for (const [key, value] of Object.entries(updates)) {
    if (state[key] !== value) {
      state[key] = value;
      changedKeys.push(key);
    }
  }

  // Persist specific keys
  if ('completedChapters' in updates) {
    setItem('completed-chapters', state.completedChapters);
  }
  if ('track' in updates) {
    setItem('track', state.track);
  }
  if ('theme' in updates) {
    setItem('theme', state.theme);
  }

  // Notify listeners
  for (const key of changedKeys) {
    const cbs = listeners.get(key);
    if (cbs) {
      cbs.forEach(fn => fn(state[key], state));
    }
  }
}

/**
 * Subscribe to state changes for a specific key.
 * @param {string} key
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export function subscribe(key, callback) {
  if (!listeners.has(key)) {
    listeners.set(key, []);
  }
  listeners.get(key).push(callback);

  return () => {
    const cbs = listeners.get(key);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
  };
}

/**
 * Toggle a chapter's completion status.
 * @param {string} chapterId
 * @returns {boolean} New completion status
 */
export function toggleChapterCompletion(chapterId) {
  const completed = [...state.completedChapters];
  const idx = completed.indexOf(chapterId);
  if (idx > -1) {
    completed.splice(idx, 1);
  } else {
    completed.push(chapterId);
  }
  setState({ completedChapters: completed });
  return idx === -1; // true = now completed
}

/**
 * Check if a chapter is completed.
 * @param {string} chapterId
 * @returns {boolean}
 */
export function isChapterCompleted(chapterId) {
  return state.completedChapters.includes(chapterId);
}

/**
 * Get overall progress percentage.
 * @param {number} total
 * @returns {number} 0-100
 */
export function getProgressPercent(total = 24) {
  if (total === 0) return 0;
  return Math.round((state.completedChapters.length / total) * 100);
}
