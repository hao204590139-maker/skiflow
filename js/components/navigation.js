/**
 * Sidebar navigation — renders the chapter tree with phases.
 */

import { getState, setState, subscribe, isChapterCompleted } from '../store.js';
import { getPhasesByTrack, appendices } from '../chapters.js';
import { createElement, $ } from '../utils/dom.js';
import { navigateToChapter, navigate } from '../router.js';

/**
 * Initialize the sidebar navigation.
 */
export function initNavigation() {
  subscribe('currentChapterId', (newId) => {
    updateActiveChapter(newId);
  });

  subscribe('completedChapters', () => {
    renderSidebar();
  });

  subscribe('track', () => {
    renderSidebar();
  });

  // Initial render
  renderSidebar();

  // Hamburger for mobile
  const hamburger = $('#hamburger');
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebarBackdrop');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = !getState().sidebarOpen;
      setState({ sidebarOpen: isOpen });
      if (sidebar) sidebar.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('show', isOpen);
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      setState({ sidebarOpen: false });
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
    });
  }

  // Close sidebar on chapter select (mobile)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-chapter') || e.target.closest('.nav-appendix-item')) {
      if (getState().sidebarOpen) {
        setState({ sidebarOpen: false });
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
      }
    }
  });
}

/**
 * Render the full sidebar.
 */
function renderSidebar() {
  const container = $('#sidebarNav');
  if (!container) return;

  const { track } = getState();
  const phases = getPhasesByTrack(track);
  const currentChapterId = getState().currentChapterId;

  container.innerHTML = '';

  // Home link
  const homeLink = createElement('div', {
    className: `nav-chapter ${!currentChapterId ? 'active' : ''}`,
    onClick: () => navigate('/'),
  }, [
    createElement('span', { className: 'nav-chapter-num' }, '🏠'),
    createElement('span', { className: 'nav-chapter-title' }, '学习首页'),
  ]);
  container.appendChild(homeLink);

  // Roadmap link
  const roadmapLink = createElement('div', {
    className: 'nav-chapter',
    onClick: () => navigate('/roadmap'),
  }, [
    createElement('span', { className: 'nav-chapter-num' }, '🗺️'),
    createElement('span', { className: 'nav-chapter-title' }, '学习路线图'),
  ]);
  container.appendChild(roadmapLink);

  // Divider
  container.appendChild(createElement('div', { style: 'height:1px;background:rgba(255,255,255,0.1);margin:8px 12px;' }));

  // Track toggle in sidebar
  const trackToggle = createElement('div', {
    style: 'display:flex;gap:4px;padding:4px 12px;margin-bottom:4px;',
  });
  const skiBtn = createElement('button', {
    className: 'sidebar-track-btn',
    style: `flex:1;padding:6px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:${track === 'ski' ? 'var(--color-primary)' : 'transparent'};color:${track === 'ski' ? '#fff' : 'var(--color-text-sidebar)'};transition:all 0.2s;`,
    onClick: () => setState({ track: 'ski' }),
  }, '🎿 双板');
  const sbBtn = createElement('button', {
    className: 'sidebar-track-btn',
    style: `flex:1;padding:6px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:${track === 'snowboard' ? 'var(--color-primary)' : 'transparent'};color:${track === 'snowboard' ? '#fff' : 'var(--color-text-sidebar)'};transition:all 0.2s;`,
    onClick: () => setState({ track: 'snowboard' }),
  }, '🏂 单板');
  trackToggle.appendChild(skiBtn);
  trackToggle.appendChild(sbBtn);
  container.appendChild(trackToggle);

  // Phases
  for (const phase of phases) {
    container.appendChild(createPhaseGroup(phase, currentChapterId));
  }

  // Appendix section
  const appSection = createElement('div', { className: 'nav-appendix' });
  appSection.appendChild(createElement('div', { className: 'nav-appendix-label' }, '📚 附录'));
  for (const app of appendices) {
    const isActive = window.location.hash.includes(app.id);
    const item = createElement('div', {
      className: `nav-appendix-item ${isActive ? 'active' : ''}`,
      onClick: () => navigate(`/appendix/${app.id}`),
    }, [
      createElement('span', {}, app.icon),
      createElement('span', {}, app.title),
    ]);
    appSection.appendChild(item);
  }
  container.appendChild(appSection);
}

/**
 * Create a collapsible phase group.
 */
function createPhaseGroup(phase, currentChapterId) {
  const isCurrentPhase = phase.chapters.some(ch => ch.id === currentChapterId);
  const phaseEl = createElement('div', {
    className: `nav-phase ${isCurrentPhase ? 'open' : ''}`,
  });

  const completedCount = phase.chapters.filter(ch => isChapterCompleted(ch.id)).length;

  const header = createElement('div', {
    className: 'nav-phase-header',
    onClick: () => {
      phaseEl.classList.toggle('open');
    },
  });

  const left = createElement('div', { className: 'nav-phase-header-left' });
  left.appendChild(createElement('span', { className: 'nav-phase-icon' }, phase.icon || '📌'));
  left.appendChild(createElement('span', { className: 'nav-phase-title' }, `Phase ${phase.num}: ${phase.title}`));
  header.appendChild(left);

  header.appendChild(createElement('span', { className: 'nav-phase-progress' },
    `${completedCount}/${phase.chapters.length}`
  ));
  header.appendChild(createElement('span', { className: 'nav-phase-arrow' }, '▶'));

  phaseEl.appendChild(header);

  const chaptersList = createElement('div', { className: 'nav-chapters' });
  for (const ch of phase.chapters) {
    const isActive = ch.id === currentChapterId;
    const isDone = isChapterCompleted(ch.id);

    const item = createElement('div', {
      className: `nav-chapter ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`,
      dataset: { chapterId: ch.id },
      onClick: () => navigateToChapter(ch.id),
    }, [
      createElement('span', { className: 'nav-chapter-num' }, `${ch.chapterNumber}.`),
      createElement('span', { className: 'nav-chapter-title' }, ch.title),
      createElement('span', { className: 'nav-chapter-check' }, '✓'),
    ]);

    chaptersList.appendChild(item);
  }

  phaseEl.appendChild(chaptersList);
  return phaseEl;
}

/**
 * Update the active chapter highlight in sidebar.
 */
function updateActiveChapter(chapterId) {
  // Remove all active states
  const allChapters = document.querySelectorAll('.nav-chapter');
  allChapters.forEach(el => el.classList.remove('active'));

  // Add active to current
  if (chapterId) {
    const activeEl = document.querySelector(`.nav-chapter[data-chapter-id="${chapterId}"]`);
    if (activeEl) {
      activeEl.classList.add('active');

      // Expand parent phase
      const phase = activeEl.closest('.nav-phase');
      if (phase) {
        phase.classList.add('open');
      }
    }
  }
}
