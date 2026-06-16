/**
 * Video embed manager — lazy-loads YouTube/Bilibili iframes.
 */

import { createElement } from '../utils/dom.js';

/**
 * Create a video embed section for a list of videos.
 * @param {Array} videos
 * @returns {HTMLElement}
 */
export function createVideoSection(videos) {
  if (!videos || videos.length === 0) return createElement('div');

  const section = createElement('div', { className: 'video-section' });
  section.appendChild(createElement('h2', { className: 'video-section-title' }, '🎥 视频教学'));

  const grid = createElement('div', { className: 'video-grid' });

  for (const video of videos) {
    grid.appendChild(createVideoItem(video));
  }

  section.appendChild(grid);
  return section;
}

/**
 * Create a single video item with lazy-loaded embed.
 * @param {Object} video
 * @returns {HTMLElement}
 */
function createVideoItem(video) {
  const item = createElement('div', { className: 'video-item' });

  // Video container with placeholder
  const container = createElement('div', { className: 'video-container' });
  const placeholder = createElement('div', {
    className: 'video-placeholder',
    onClick: (e) => {
      e.preventDefault();
      loadVideo(container, video);
    },
  });

  placeholder.appendChild(createElement('span', { className: 'video-placeholder-icon' }, '▶️'));
  placeholder.appendChild(createElement('span', { className: 'video-placeholder-text' }, '点击加载视频'));
  container.appendChild(placeholder);
  item.appendChild(container);

  // Video info
  const info = createElement('div', { className: 'video-info' });
  info.appendChild(createElement('span', { className: 'video-title' }, video.title || '教学视频'));
  info.appendChild(createElement('span', { className: 'video-channel' }, video.channel || ''));

  const platformLabel = video.platform === 'bilibili' ? 'B站' : 'YouTube';
  const platformCls = video.platform === 'bilibili' ? 'bilibili' : 'youtube';
  info.appendChild(createElement('span', { className: `video-platform ${platformCls}` }, platformLabel));

  item.appendChild(info);
  return item;
}

/**
 * Replace placeholder with actual iframe.
 */
function loadVideo(container, video) {
  container.innerHTML = '';

  if (video.platform === 'bilibili') {
    const iframe = createElement('iframe', {
      src: `https://player.bilibili.com/player.html?bvid=${video.videoId}&page=1&high_quality=1&autoplay=0`,
      allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture',
      allowfullscreen: 'true',
      loading: 'lazy',
    });
    container.appendChild(iframe);
  } else {
    // YouTube
    const iframe = createElement('iframe', {
      src: `https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&cc_load_policy=1&hl=zh-Hans`,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowfullscreen: 'true',
      loading: 'lazy',
      referrerpolicy: 'strict-origin-when-cross-origin',
    });
    container.appendChild(iframe);
  }
}

/**
 * Get a direct watch URL for a video.
 */
export function getVideoWatchUrl(video) {
  if (video.platform === 'bilibili') {
    return `https://www.bilibili.com/video/${video.videoId}/`;
  }
  return `https://www.youtube.com/watch?v=${video.videoId}`;
}
