/**
 * Ski Academy — Main Application
 * Initializes all modules and manages the app lifecycle.
 */

import { getState, setState } from './store.js';
import { initRouter, onRoute, navigate, parseRoute } from './router.js';
import { initNavigation } from './components/navigation.js';
import { initProgress } from './components/progress.js';
import { initSearch } from './components/search.js';
import { initTheme } from './components/theme.js';
import { renderHome, renderChapter, renderRoadmap, renderAppendix } from './components/content.js';
import { getChaptersByTrack } from './chapters.js';
import { $ } from './utils/dom.js';

/**
 * Initialize the entire application.
 */
function init() {
  // Initialize core systems
  initTheme();
  initProgress();
  initSearch();
  initNavigation();

  // Set up routing
  onRoute((route) => {
    handleRoute(route);
  });

  // Initialize router (fires initial route)
  initRouter();

  // Hero button click handlers
  setupHeroButtons();

  // Track change event listener
  document.body.addEventListener('track-change', (e) => {
    setState({ track: e.detail });
    renderHome(e.detail);
  });

  // Keyboard shortcuts
  setupKeyboardShortcuts();
}

/**
 * Handle route changes.
 */
function handleRoute(route) {
  const { view, track, chapterId, appendixId } = route;

  // Update track in state if provided
  if (track && track !== getState().track) {
    setState({ track });
  }

  const currentTrack = track || getState().track;

  switch (view) {
    case 'home':
      setState({ currentChapterId: null, currentView: 'home' });
      renderHome(currentTrack);
      break;

    case 'chapter':
      if (!chapterId) {
        navigate('/');
        return;
      }
      setState({ currentChapterId: chapterId, currentView: 'chapter' });
      renderChapter(chapterId);
      break;

    case 'roadmap':
      setState({ currentChapterId: null, currentView: 'roadmap' });
      renderRoadmap();
      break;

    case 'appendix':
      if (!appendixId) {
        navigate('/');
        return;
      }
      setState({ currentChapterId: null, currentView: 'appendix' });
      renderAppendix(appendixId);
      break;

    default:
      navigate('/');
  }
}

/**
 * Set up hero button click navigation.
 */
function setupHeroButtons() {
  // Delegate click events for data-nav buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;

    e.preventDefault();
    const target = btn.getAttribute('data-nav');
    if (!target) return;

    if (target === 'roadmap') {
      navigate('/roadmap');
    } else {
      // It's a chapter ID
      const { track } = getState();
      const chapterId = target;
      const chTrack = chapterId.startsWith('sb-') ? 'snowboard' : 'ski';
      if (chTrack !== track) {
        setState({ track: chTrack });
      }
      navigate(`/${chTrack}/${chapterId.replace(/^(ski|sb)-/, '')}`);
    }
  });
}

/**
 * Keyboard shortcuts for navigation.
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const { currentView, currentChapterId, track } = getState();

    if (currentView === 'chapter' && currentChapterId) {
      const chapters = getChaptersByTrack(track);
      const idx = chapters.findIndex(ch => ch.id === currentChapterId);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < chapters.length - 1) {
          const next = chapters[idx + 1];
          navigate(`/${track}/${next.id.replace(/^(ski|sb)-/, '')}`);
        }
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) {
          const prev = chapters[idx - 1];
          navigate(`/${track}/${prev.id.replace(/^(ski|sb)-/, '')}`);
        }
      }
    }
  });
}

// Boot the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
