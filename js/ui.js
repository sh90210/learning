// Small DOM helpers shared by the screens.
import { say, stop, sfx } from './audio.js';
import { ICON } from './art.js';

export const app = { kid: 'tay', profile: null, settings: { voice: 'playful' }, go: null };

export function html(str) {
  const t = document.createElement('template');
  t.innerHTML = str.trim();
  return t.content.firstElementChild;
}

export function mount(el) {
  stop();
  const root = document.getElementById('app');
  root.innerHTML = '';
  root.appendChild(el);
  return el;
}

export function $(el, sel) { return el.querySelector(sel); }
export function $$(el, sel) { return [...el.querySelectorAll(sel)]; }

export function on(el, sel, fn) {
  $$(el, sel).forEach((n) => n.addEventListener('click', (e) => { e.preventDefault(); fn(n, e); }));
}

// A speaker button that pulses while 망고 talks.
export async function talk(btn, ...lines) {
  if (btn) btn.classList.add('talking');
  await say(...lines);
  if (btn) btn.classList.remove('talking');
}

export function coinPill(n) {
  return `<span class="pill" aria-label="코인 ${n}">${ICON.star()}<b class="coins">${n}</b></span>`;
}

export function burst(container, n = 12) {
  const b = html('<div class="burst" aria-hidden="true"></div>');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    const a = (Math.PI * 2 * i) / n;
    s.style.setProperty('--dx', `${Math.cos(a) * 220}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * 160}px`);
    s.innerHTML = ICON.star(['#FFD86B', '#5ED3C7', '#FF9AC4', '#C8F27A'][i % 4]);
    b.appendChild(s);
  }
  container.appendChild(b);
  sfx('star');
  setTimeout(() => b.remove(), 1000);
}

export function toast(msg) {
  const t = html(`<div class="toast">${msg}</div>`);
  document.getElementById('stage').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

export function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Fit the 1280×800 stage to the screen.
export function fitStage() {
  const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  document.getElementById('stage').style.transform = `translate(-50%, -50%) scale(${s})`;
}

export function drawSky() {
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let out = '';
  for (let i = 0; i < 90; i++) {
    out += `<circle cx="${Math.round(rnd() * 1280)}" cy="${Math.round(rnd() * 800)}" r="${(rnd() * 2 + 0.6).toFixed(1)}" fill="#FFFFFF" opacity="${(rnd() * 0.6 + 0.25).toFixed(2)}"/>`;
  }
  document.getElementById('sky').innerHTML = out;
}

export function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
