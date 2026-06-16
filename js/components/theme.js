/**
 * Theme manager — handles dark/light mode toggle.
 */

import { getState, setState, subscribe } from '../store.js';

/**
 * Initialize theme system.
 */
export function initTheme() {
  const { theme } = getState();
  applyTheme(theme);

  // Listen for theme changes from other components
  subscribe('theme', (newTheme) => {
    applyTheme(newTheme);
  });

  // Check system preference on first visit
  const stored = getState().theme;
  if (!stored) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setState({ theme: prefersDark ? 'dark' : 'light' });
  }

  // Toggle button
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = getState().theme;
      setState({ theme: current === 'light' ? 'dark' : 'light' });
    });
  }
}

/**
 * Apply theme to document.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
