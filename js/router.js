/**
 * Hash-based SPA router with track support.
 * URL patterns:
 *   #/                  → home
 *   #/ski/1-1           → ski chapter
 *   #/snowboard/1-1     → snowboard chapter
 *   #/roadmap           → learning roadmap
 *   #/appendix/a        → appendix page
 */

import { setState, getState } from './store.js';

/** @type {Function|null} */
let routeHandler = null;

/**
 * Parse the current hash into route params.
 * @returns {{ view: string, track?: string, chapterId?: string, appendixId?: string }}
 */
export function parseRoute() {
  const hash = window.location.hash.slice(1) || '/';

  if (hash === '/' || hash === '') {
    return { view: 'home' };
  }

  const parts = hash.split('/').filter(Boolean);

  // /ski/1-1 or /snowboard/1-1
  if ((parts[0] === 'ski' || parts[0] === 'snowboard') && parts[1]) {
    return { view: 'chapter', track: parts[0], chapterId: parts[0] + '-' + parts[1] };
  }

  // Legacy: /chapter/ski-1-1
  if (parts[0] === 'chapter' && parts[1]) {
    const id = parts[1];
    const track = id.startsWith('sb-') ? 'snowboard' : 'ski';
    return { view: 'chapter', track, chapterId: id };
  }

  if (parts[0] === 'roadmap') {
    return { view: 'roadmap' };
  }

  if (parts[0] === 'appendix' && parts[1]) {
    return { view: 'appendix', appendixId: parts[1] };
  }

  return { view: 'home' };
}

/**
 * Navigate to a route.
 * @param {string} path - e.g. '/ski/1-1', '/roadmap'
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Navigate to a chapter.
 * @param {string} chapterId - e.g. 'ski-1-1' or 'sb-1-1'
 */
export function navigateToChapter(chapterId) {
  const track = chapterId.startsWith('sb-') ? 'snowboard' : 'ski';
  const num = chapterId.replace(/^(ski|sb)-/, '');
  navigate(`/${track}/${num}`);
}

/**
 * Set the route change handler.
 * @param {Function} handler - receives parsed route { view, track, chapterId }
 */
export function onRoute(handler) {
  routeHandler = handler;
}

/**
 * Initialize the router.
 */
export function initRouter() {
  window.addEventListener('hashchange', () => {
    const route = parseRoute();
    if (routeHandler) {
      routeHandler(route);
    }
  });

  // Initial route
  const route = parseRoute();
  if (routeHandler) {
    // setTimeout to let DOM settle
    setTimeout(() => routeHandler(route), 0);
  }
}

/**
 * Get the current route.
 */
export function getCurrentRoute() {
  return parseRoute();
}
