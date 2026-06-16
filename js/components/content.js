/**
 * Content renderer — renders chapter content, home page, roadmap, and appendices.
 */

import { getState, isChapterCompleted } from '../store.js';
import { getChapterById, getChaptersByTrack, getPhasesByTrack, appendices } from '../chapters.js';
import { createElement, $ } from '../utils/dom.js';
import { createVideoSection } from './video.js';
import { handleMarkComplete } from './progress.js';
import { navigateToChapter, navigate } from '../router.js';

/**
 * Render the home page with phase cards.
 * @param {string} track
 */
export function renderHome(track) {
  const homePage = $('#homePage');
  const chapterPage = $('#chapterPage');
  const roadmapPage = $('#roadmapPage');

  if (homePage) homePage.style.display = 'block';
  if (chapterPage) chapterPage.style.display = 'none';
  if (roadmapPage) roadmapPage.style.display = 'none';

  // Update hero button
  const startBtn = document.querySelector('[data-nav="ski-1-1"]');
  if (startBtn && track === 'snowboard') {
    startBtn.setAttribute('data-nav', 'sb-1-1');
    startBtn.textContent = '🏂 开始学习';
  }

  // Render phases grid
  const phasesContainer = $('#phasesOverview');
  if (!phasesContainer) return;

  phasesContainer.innerHTML = '';

  const title = createElement('h2', { className: 'phases-title' },
    track === 'ski' ? '🎿 双板滑雪 — 学习阶段' : '🏂 单板滑雪 — 学习阶段'
  );
  phasesContainer.appendChild(title);

  // Track switcher
  const switcher = createElement('div', { className: 'track-switcher' });
  const skiBtn = createElement('button', {
    className: `track-switch-btn ${track === 'ski' ? 'active' : ''}`,
    onClick: () => {
      navigate('/');
      setTimeout(() => {
        document.body.dispatchEvent(new CustomEvent('track-change', { detail: 'ski' }));
      }, 50);
    },
  }, '🎿 双板');
  const sbBtn = createElement('button', {
    className: `track-switch-btn ${track === 'snowboard' ? 'active' : ''}`,
    onClick: () => {
      navigate('/');
      setTimeout(() => {
        document.body.dispatchEvent(new CustomEvent('track-change', { detail: 'snowboard' }));
      }, 50);
    },
  }, '🏂 单板');
  switcher.appendChild(skiBtn);
  switcher.appendChild(sbBtn);
  phasesContainer.appendChild(switcher);

  // Also update hero buttons based on track
  updateHeroButtons(track);

  const phases = getPhasesByTrack(track);
  const grid = createElement('div', { className: 'phases-grid' });

  for (const phase of phases) {
    const completedCount = phase.chapters.filter(ch => isChapterCompleted(ch.id)).length;
    grid.appendChild(createPhaseCard(phase, completedCount));
  }

  phasesContainer.appendChild(grid);
}

/**
 * Update hero buttons for the current track.
 */
function updateHeroButtons(track) {
  const startBtn = document.querySelector('[data-nav]');
  if (startBtn) {
    const chapterId = track === 'ski' ? 'ski-1-1' : 'sb-1-1';
    startBtn.setAttribute('data-nav', chapterId);
    startBtn.textContent = track === 'ski' ? '🎿 开始学习' : '🏂 开始学习';
  }
}

/**
 * Create a phase card for the home page.
 */
function createPhaseCard(phase, completedCount) {
  const phaseIcons = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🔥', 5: '👑' };

  const card = createElement('div', {
    className: `phase-card phase-${phase.num}`,
    onClick: () => {
      const firstChapter = phase.chapters[0];
      if (firstChapter) navigateToChapter(firstChapter.id);
    },
  });

  const header = createElement('div', { className: 'phase-card-header' });
  header.appendChild(createElement('span', { className: 'phase-card-icon' }, phaseIcons[phase.num] || '⛷️'));
  header.appendChild(createElement('h3', { className: 'phase-card-title' }, `Phase ${phase.num}: ${phase.title}`));
  card.appendChild(header);

  const chaptersList = phase.chapters.map(ch =>
    `${ch.chapterNumber}.${ch.title}`
  ).join(' · ');
  card.appendChild(createElement('p', { className: 'phase-card-desc' }, chaptersList));

  const meta = createElement('div', { className: 'phase-card-meta' });
  meta.appendChild(createElement('span', {}, `${phase.chapters.length} 章`));

  const progressWrap = createElement('div', { className: 'phase-card-progress' });
  const bar = createElement('div', { className: 'phase-card-progress-bar' });
  const percent = phase.chapters.length > 0 ? Math.round((completedCount / phase.chapters.length) * 100) : 0;
  const fill = createElement('div', {
    className: 'phase-card-progress-fill',
    style: `width:${percent}%;background:var(--color-phase-${phase.num})`,
  });
  bar.appendChild(fill);
  progressWrap.appendChild(bar);
  progressWrap.appendChild(createElement('span', {}, `${completedCount}/${phase.chapters.length}`));
  meta.appendChild(progressWrap);

  card.appendChild(meta);
  return card;
}

/**
 * Render a chapter page.
 * @param {string} chapterId
 */
export function renderChapter(chapterId) {
  const homePage = $('#homePage');
  const chapterPage = $('#chapterPage');
  const roadmapPage = $('#roadmapPage');

  if (homePage) homePage.style.display = 'none';
  if (chapterPage) chapterPage.style.display = 'block';
  if (roadmapPage) roadmapPage.style.display = 'none';

  const chapter = getChapterById(chapterId);
  if (!chapter) {
    $('#chapterContent').innerHTML = '<div class="text-center mt-8"><h2>章节未找到</h2><p>请从目录中选择一个章节</p></div>';
    return;
  }

  renderChapterContent(chapter);
  renderBreadcrumb(chapter);
  renderChapterNav(chapterId);
  renderMarkComplete(chapterId);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render the chapter content.
 */
function renderChapterContent(chapter) {
  const container = $('#chapterContent');
  if (!container) return;
  container.innerHTML = '';

  // Header
  const header = createElement('div', { className: 'chapter-header' });

  const badge = createElement('span', {
    className: `chapter-phase-badge phase-${chapter.phaseNum}`,
  }, `${chapter.phase}`);
  header.appendChild(badge);

  header.appendChild(createElement('h1', { className: 'chapter-title' },
    `${chapter.icon || ''} 第${chapter.chapterNumber}章：${chapter.title}`
  ));

  // Meta row
  const meta = createElement('div', { className: 'chapter-meta' });
  meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, `⏱️ 约${chapter.readingTime}分钟`));
  meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, `📚 ${chapter.phase}`));
  meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, `🔑 ${chapter.keyPoints.length}个知识点`));
  header.appendChild(meta);

  container.appendChild(header);

  // Videos
  if (chapter.videos && chapter.videos.length > 0) {
    container.appendChild(createVideoSection(chapter.videos));
  }

  // Content sections
  for (const section of chapter.sections) {
    container.appendChild(renderSection(section));
  }

  // Key points
  if (chapter.keyPoints && chapter.keyPoints.length > 0) {
    const kpWrap = createElement('div', { className: 'content-section' });
    kpWrap.appendChild(createElement('h3', { className: 'section-heading' },
      createElement('span', { className: 'section-icon' }, '🔑') + ' 本章知识点'
    ));
    const tags = createElement('div', { className: 'key-points' });
    for (const kp of chapter.keyPoints) {
      tags.appendChild(createElement('span', { className: 'key-point-tag' }, kp));
    }
    kpWrap.appendChild(tags);
    container.appendChild(kpWrap);
  }
}

/**
 * Render a single content section.
 */
function renderSection(section) {
  const wrapper = createElement('div', { className: 'content-section' });
  const icon = section.icon || '📌';
  wrapper.appendChild(createElement('h3', { className: 'section-heading' },
    createElement('span', { className: 'section-icon' }, icon) + ' ' + section.title
  ));
  const body = createElement('div', { className: 'section-body' });
  body.innerHTML = section.content;
  wrapper.appendChild(body);
  return wrapper;
}

/**
 * Render breadcrumb navigation.
 */
function renderBreadcrumb(chapter) {
  const bc = $('#breadcrumb');
  if (!bc) return;
  bc.innerHTML = '';

  const trackLabel = chapter.track === 'ski' ? '🎿 双板滑雪' : '🏂 单板滑雪';
  const homeLink = createElement('a', { href: '#/', onClick: (e) => { e.preventDefault(); navigate('/'); } }, '🏠 首页');
  const trackLink = createElement('a', { href: '#/', onClick: (e) => { e.preventDefault(); navigate('/'); } }, trackLabel);
  const sep = createElement('span', { className: 'breadcrumb-sep' }, '›');
  const sep2 = createElement('span', { className: 'breadcrumb-sep' }, '›');
  const phaseText = createElement('span', {}, chapter.phase);
  const current = createElement('span', { style: 'color:var(--color-text);font-weight:600;' }, chapter.title);

  bc.appendChild(homeLink);
  bc.appendChild(sep);
  bc.appendChild(trackLink);
  bc.appendChild(sep2);
  bc.appendChild(phaseText);
  bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
  bc.appendChild(current);
}

/**
 * Render prev/next chapter navigation.
 */
function renderChapterNav(currentId) {
  const nav = $('#chapterNavBottom');
  if (!nav) return;
  nav.innerHTML = '';

  const chapter = getChapterById(currentId);
  if (!chapter) return;

  const chapters = getChaptersByTrack(chapter.track);
  const idx = chapters.findIndex(ch => ch.id === currentId);

  const prevChapter = idx > 0 ? chapters[idx - 1] : null;
  const nextChapter = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const prevBtn = createElement('button', {
    className: 'chapter-nav-btn',
    disabled: !prevChapter ? 'true' : undefined,
    onClick: () => {
      if (prevChapter) navigateToChapter(prevChapter.id);
    },
  });
  prevBtn.innerHTML = `◀ ${prevChapter ? `第${prevChapter.chapterNumber}章：${prevChapter.title}` : '已是最前'}`;
  nav.appendChild(prevBtn);

  const nextBtn = createElement('button', {
    className: 'chapter-nav-btn',
    disabled: !nextChapter ? 'true' : undefined,
    onClick: () => {
      if (nextChapter) navigateToChapter(nextChapter.id);
    },
  });
  nextBtn.innerHTML = `${nextChapter ? `第${nextChapter.chapterNumber}章：${nextChapter.title}` : '已是最后'} ▶`;
  nav.appendChild(nextBtn);
}

/**
 * Render the mark-complete button.
 */
function renderMarkComplete(chapterId) {
  const container = $('#chapterContent');
  if (!container) return;

  // Remove existing button if any
  const existing = $('#markCompleteBtn');
  if (existing) existing.parentElement?.remove();

  const wrap = createElement('div', { className: 'mark-complete-wrap' });
  const isCompleted = isChapterCompleted(chapterId);
  const btn = createElement('button', {
    id: 'markCompleteBtn',
    className: `btn btn-outline mark-complete-btn ${isCompleted ? 'completed' : ''}`,
    onClick: () => {
      handleMarkComplete();
    },
  }, isCompleted ? '✅ 已完成 — 点击取消' : '✅ 标记完成');

  wrap.appendChild(btn);
  container.appendChild(wrap);
}

/**
 * Render the roadmap page.
 */
export function renderRoadmap() {
  const homePage = $('#homePage');
  const chapterPage = $('#chapterPage');
  const roadmapPage = $('#roadmapPage');

  if (homePage) homePage.style.display = 'none';
  if (chapterPage) chapterPage.style.display = 'none';
  if (roadmapPage) roadmapPage.style.display = 'block';
  if (!roadmapPage) return;

  const { track } = getState();
  const phases = getPhasesByTrack(track);

  roadmapPage.innerHTML = '';

  roadmapPage.appendChild(createElement('h1', { className: 'roadmap-title' },
    track === 'ski' ? '🎿 双板学习路线图' : '🏂 单板学习路线图'
  ));

  const timeline = createElement('div', { className: 'roadmap-timeline' });

  for (const phase of phases) {
    const phaseEl = createElement('div', { className: 'roadmap-phase' });
    const dot = createElement('div', { className: `roadmap-phase-dot phase-${phase.num}` });
    phaseEl.appendChild(dot);
    phaseEl.appendChild(createElement('h2', { className: 'roadmap-phase-title' },
      `Phase ${phase.num}: ${phase.title}`
    ));

    const list = createElement('div', { className: 'roadmap-chapter-list' });
    for (const ch of phase.chapters) {
      const item = createElement('div', {
        className: 'roadmap-chapter',
        onClick: () => navigateToChapter(ch.id),
      });
      const completed = isChapterCompleted(ch.id);
      item.appendChild(createElement('span', { className: 'roadmap-chapter-num' },
        `${ch.chapterNumber}.`
      ));
      item.appendChild(createElement('span', {}, ch.title));
      if (completed) {
        item.appendChild(createElement('span', { style: 'color:var(--color-success);' }, '✅'));
      }
      list.appendChild(item);
    }
    phaseEl.appendChild(list);
    timeline.appendChild(phaseEl);
  }

  roadmapPage.appendChild(timeline);
}

/**
 * Render an appendix page.
 */
export function renderAppendix(appendixId) {
  const homePage = $('#homePage');
  const chapterPage = $('#chapterPage');
  const roadmapPage = $('#roadmapPage');

  if (homePage) homePage.style.display = 'none';
  if (chapterPage) chapterPage.style.display = 'block';
  if (roadmapPage) roadmapPage.style.display = 'none';

  const appendix = appendices.find(a => a.id === appendixId);
  if (!appendix) {
    $('#chapterContent').innerHTML = '<div class="text-center mt-8"><h2>附录未找到</h2></div>';
    return;
  }

  const bc = $('#breadcrumb');
  if (bc) {
    bc.innerHTML = '';
    bc.appendChild(createElement('a', { href: '#/', onClick: (e) => { e.preventDefault(); navigate('/'); } }, '🏠 首页'));
    bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
    bc.appendChild(createElement('span', {}, '📚 附录'));
    bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
    bc.appendChild(createElement('span', { style: 'color:var(--color-text);font-weight:600;' }, appendix.title));
  }

  const container = $('#chapterContent');
  if (container) {
    container.innerHTML = '';
    const header = createElement('div', { className: 'chapter-header' });
    header.appendChild(createElement('h1', { className: 'chapter-title' }, `${appendix.icon} ${appendix.title}`));
    container.appendChild(header);

    const body = createElement('div', { className: 'content-section' });
    const bodyInner = createElement('div', { className: 'section-body' });
    bodyInner.innerHTML = appendix.content;
    body.appendChild(bodyInner);
    container.appendChild(body);
  }

  // Hide bottom nav for appendix
  const nav = $('#chapterNavBottom');
  if (nav) nav.innerHTML = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
