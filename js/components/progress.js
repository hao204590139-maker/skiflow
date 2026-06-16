/**
 * Progress tracker — handles completion toggling and UI update.
 */

import { getState, setState, subscribe, toggleChapterCompletion, isChapterCompleted, getProgressPercent } from '../store.js';
import { getTotalChapters } from '../chapters.js';

/**
 * Initialize progress tracking.
 */
export function initProgress() {
  subscribe('completedChapters', () => {
    updateProgressUI();
  });

  subscribe('track', () => {
    updateProgressUI();
  });

  // Initial render
  updateProgressUI();
}

/**
 * Update the progress ring and text.
 */
function updateProgressUI() {
  const { track } = getState();
  const total = getTotalChapters(track);
  const percent = getProgressPercent(total);
  const { completedChapters } = getState();

  const trackCompleted = completedChapters.filter(id => {
    if (track === 'ski') return id.startsWith('ski-');
    return id.startsWith('sb-');
  });
  const trackPercent = total > 0 ? Math.round((trackCompleted.length / total) * 100) : 0;

  const circle = document.getElementById('progressCircle');
  const text = document.getElementById('progressText');

  if (circle) {
    const circumference = 2 * Math.PI * 15.5; // r=15.5
    const dashLen = (trackPercent / 100) * circumference;
    circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference}`);
  }

  if (text) {
    text.textContent = `${trackPercent}%`;
  }

  // Update mark-complete button if on chapter page
  const btn = document.getElementById('markCompleteBtn');
  if (btn) {
    const chId = getState().currentChapterId;
    if (chId && isChapterCompleted(chId)) {
      btn.textContent = '✅ 已完成 — 点击取消';
      btn.classList.add('completed');
    } else {
      btn.textContent = '✅ 标记完成';
      btn.classList.remove('completed');
    }
  }
}

/**
 * Handle mark-complete button click.
 */
export function handleMarkComplete() {
  const { currentChapterId } = getState();
  if (!currentChapterId) return;
  toggleChapterCompletion(currentChapterId);
}
