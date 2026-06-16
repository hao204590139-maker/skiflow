/**
 * DOM utility helpers.
 */

/**
 * Query a single element.
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query all matching elements.
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Create an element with attributes and children.
 * @param {string} tag
 * @param {object} [attrs={}]
 * @param {(string|Node|Array)} [children]
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = null) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== undefined && value !== null) {
      el.setAttribute(key, value);
    }
  }

  if (children !== null && children !== undefined) {
    if (Array.isArray(children)) {
      for (const child of children) {
        appendChild(el, child);
      }
    } else {
      appendChild(el, children);
    }
  }

  return el;
}

/**
 * Append a child (string → text node, Node → append).
 * @param {HTMLElement} parent
 * @param {string|Node} child
 */
function appendChild(parent, child) {
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  }
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 200) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Highlight search terms in text.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
export function highlightText(text, query) {
  if (!query.trim()) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return escapeHtml(text).replace(
    new RegExp(`(${escaped.replace(/\\/g, '\\\\')})`, 'gi'),
    '<mark>$1</mark>'
  );
}

/**
 * Scroll to element smoothly.
 * @param {Element} el
 */
export function scrollToElement(el) {
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
