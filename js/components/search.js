/**
 * Full-text search across all chapter content.
 */

import { skiChapters, snowboardChapters, appendices } from '../chapters.js';
import { createElement, $, $$, highlightText } from '../utils/dom.js';
import { navigateToChapter, navigate } from '../router.js';

/** @type {Array<{chapter: object, text: string}>} */
let searchIndex = [];

/**
 * Initialize the search system.
 */
export function initSearch() {
  buildIndex();

  // Header search box
  const searchInput = $('#searchInput');
  const searchBox = $('#searchBox');
  const overlay = $('#searchOverlay');
  const overlayInput = $('#overlaySearchInput');
  const searchClose = $('#searchClose');
  const backdrop = overlay?.querySelector('.search-overlay-backdrop');

  // Click search box → open overlay
  if (searchBox) {
    searchBox.addEventListener('click', () => openSearch());
  }
  if (searchInput) {
    searchInput.addEventListener('focus', () => openSearch());
  }

  // Close button
  if (searchClose) {
    searchClose.addEventListener('click', () => closeSearch());
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => closeSearch());
  }

  // Overlay input
  if (overlayInput) {
    overlayInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });
  }

  // Keyboard shortcut: Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay?.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    // Escape to close
    if (e.key === 'Escape') {
      if (overlay?.classList.contains('open')) {
        closeSearch();
      }
    }
  });
}

/**
 * Build the search index from all chapters.
 */
function buildIndex() {
  searchIndex = [];

  const allChapters = [...skiChapters, ...snowboardChapters];

  for (const ch of allChapters) {
    const textParts = [ch.title, ch.phase];
    for (const section of ch.sections) {
      // Strip HTML tags for indexing
      textParts.push(section.title);
      textParts.push(section.content.replace(/<[^>]*>/g, ' '));
    }
    textParts.push(ch.keyPoints.join(' '));
    searchIndex.push({ chapter: ch, text: textParts.join(' ').toLowerCase() });
  }

  // Also index appendices
  for (const app of appendices) {
    searchIndex.push({
      chapter: { id: app.id, title: app.title, phase: '附录', phaseNum: 0, track: 'appendix', icon: app.icon },
      text: (app.title + ' ' + app.content.replace(/<[^>]*>/g, ' ')).toLowerCase(),
    });
  }
}

/**
 * Open the search overlay.
 */
function openSearch() {
  const overlay = $('#searchOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  const input = $('#overlaySearchInput');
  if (input) {
    input.value = '';
    input.focus();
    // Set placeholder
    input.placeholder = '搜索课程内容... (输入关键词)';
  }
  // Clear results
  const results = $('#searchResults');
  if (results) {
    results.innerHTML = '<div class="search-empty">输入关键词开始搜索课程内容</div>';
  }
}

/**
 * Close the search overlay.
 */
function closeSearch() {
  const overlay = $('#searchOverlay');
  if (overlay) overlay.classList.remove('open');
}

/**
 * Perform search and render results.
 * @param {string} query
 */
function performSearch(query) {
  const resultsContainer = $('#searchResults');
  if (!resultsContainer) return;

  const q = query.trim().toLowerCase();

  if (!q) {
    resultsContainer.innerHTML = '<div class="search-empty">输入关键词开始搜索课程内容</div>';
    return;
  }

  const results = [];
  for (const entry of searchIndex) {
    if (entry.text.includes(q)) {
      // Find snippet context
      const idx = entry.text.indexOf(q);
      const start = Math.max(0, idx - 30);
      const end = Math.min(entry.text.length, idx + q.length + 50);
      let snippet = entry.text.slice(start, end);
      if (start > 0) snippet = '...' + snippet;
      if (end < entry.text.length) snippet = snippet + '...';

      results.push({
        chapter: entry.chapter,
        snippet,
      });
    }
  }

  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <div class="search-no-results-icon">🔍</div>
        <div class="search-no-results-text">未找到与"${query}"相关的内容</div>
        <div style="color:var(--color-text-muted);font-size:12px;margin-top:8px;">试试其他关键词，如：犁式、换刃、卡宾、粉雪</div>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = '';
  for (const result of results.slice(0, 20)) {
    const item = createElement('div', {
      className: 'search-result-item',
      onClick: () => {
        closeSearch();
        if (result.chapter.track === 'appendix') {
          navigate(`/appendix/${result.chapter.id}`);
        } else {
          navigateToChapter(result.chapter.id);
        }
      },
    });

    const icon = createElement('span', { className: 'search-result-icon' }, result.chapter.icon || '📌');
    const info = createElement('div', { className: 'search-result-info' });

    const trackLabel = result.chapter.track === 'ski' ? '🎿 双板' :
                       result.chapter.track === 'snowboard' ? '🏂 单板' : '📚 附录';
    const titleText = result.chapter.track === 'appendix'
      ? result.chapter.title
      : `第${result.chapter.chapterNumber}章：${result.chapter.title}`;

    info.appendChild(createElement('div', { className: 'search-result-title' }, titleText));
    info.appendChild(createElement('div', { className: 'search-result-phase' },
      `${trackLabel} · ${result.chapter.phase}`
    ));

    const snippet = createElement('div', { className: 'search-result-snippet' });
    snippet.innerHTML = highlightText(result.snippet, query);
    info.appendChild(snippet);

    item.appendChild(icon);
    item.appendChild(info);
    resultsContainer.appendChild(item);
  }

  if (results.length > 20) {
    resultsContainer.appendChild(
      createElement('div', { style: 'text-align:center;padding:12px;color:var(--color-text-muted);font-size:12px;' },
        `显示前20条，共${results.length}条结果，请尝试更精确的关键词`
      )
    );
  }
}
