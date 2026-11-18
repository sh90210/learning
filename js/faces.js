// Kids' face photos for the first screen. Photos are picked in 어른용 and stay
// on this tablet only (IndexedDB "photo:<kid>"), never in the app's files.
import { store } from './store.js';

export const KID_COLOR = { tay: '#FF8A3D', theo: '#2BB5A8' };

export const getPhoto = (kid) => store.get(`photo:${kid}`);
export const setPhoto = (kid, dataUrl) => store.set(`photo:${kid}`, dataUrl);

// Read an image file and crop a square around where a face usually is.
export function photoFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const side = Math.min(w, h) * (h > w ? 0.62 : 0.8);
      const cx = w / 2, cy = h > w ? h * 0.42 : h / 2;
      const sx = Math.max(0, Math.min(w - side, cx - side / 2));
      const sy = Math.max(0, Math.min(h - side, cy - side / 2));
      const c = document.createElement('canvas');
      c.width = c.height = 400;
      c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, 400, 400);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('사진을 열 수 없어요')); };
    img.src = url;
  });
}

const sparkle = (x, y, s, c = '#FFD86B') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill="${c}"/>`;
let uid = 0;

// inside of the frame: the photo, or the kid's first letter if no photo yet
function inner(id, photo, c, r, letter) {
  const d = r * 2;
  return photo
    ? `<image href="${photo}" x="${150 - r}" y="${130 - r}" width="${d}" height="${d}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="150" cy="130" r="${r}" fill="${c}" opacity="0.55"/><text x="150" y="${130 + r * 0.36}" text-anchor="middle" font-family="Jua" font-size="${r}" fill="#FFFFFF">${letter}</text>`;
}

// B: rocket porthole
function porthole(photo, c, letter) {
  const id = `fp${uid++}`;
  const bolts = Array.from({ length: 8 }, (_, i) => `<circle cx="${(150 + 113 * Math.cos(i * 0.785)).toFixed(1)}" cy="${(130 + 113 * Math.sin(i * 0.785)).toFixed(1)}" r="6" fill="#8C93B8" stroke="#E6E9F7" stroke-width="2"/>`).join('');
  return `<svg class="face" viewBox="0 0 300 260" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="150" cy="130" r="96"/></clipPath>
    <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1F3FF"/><stop offset=".5" stop-color="#A7AEC9"/><stop offset="1" stop-color="#6E7596"/></linearGradient></defs>
    <circle cx="150" cy="130" r="126" fill="${c}" opacity=".35"/>
    <circle cx="150" cy="130" r="122" fill="url(#${id}m)"/>
    <circle cx="150" cy="130" r="102" fill="#3A4170"/>
    ${inner(id, photo, c, 96, letter)}
    <path d="M86 78 A80 80 0 0 1 150 50" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".5"/>
    ${bolts}
    <g transform="translate(236 196) rotate(35)"><path d="M0 -26 C10 -16 10 6 6 14 L-6 14 C-10 6 -10 -16 0 -26Z" fill="#fff"/><circle cy="-6" r="5" fill="${c}"/><path d="M-6 6 L-14 18 L-6 14Z M6 6 L14 18 L6 14Z" fill="${c}"/><path d="M-4 15 L0 26 L4 15Z" fill="#FFB347"/></g>
    ${sparkle(36, 40, 1.2)}${sparkle(52, 226, 0.9, '#5ED3C7')}
  </svg>`;
}

// C: starburst badge with a crown
function badge(photo, c, letter) {
  const id = `fb${uid++}`;
  const pts = Array.from({ length: 28 }, (_, i) => { const r = i % 2 ? 108 : 124, a = (i * Math.PI) / 14 - Math.PI / 2; return `${(150 + r * Math.cos(a)).toFixed(1)},${(130 + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const dots = Array.from({ length: 14 }, (_, i) => `<circle cx="${(150 + 104 * Math.cos((i * Math.PI) / 7)).toFixed(1)}" cy="${(130 + 104 * Math.sin((i * Math.PI) / 7)).toFixed(1)}" r="4.5" fill="#fff" opacity=".9"/>`).join('');
  return `<svg class="face" viewBox="0 -24 300 284" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="150" cy="130" r="94"/></clipPath></defs>
    <polygon points="${pts}" fill="#FFD86B" stroke="${c}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="150" cy="130" r="100" fill="${c}"/>
    ${dots}
    ${inner(id, photo, c, 94, letter)}
    <g transform="translate(150 6)"><path d="M-34 22 L-28 -6 L-14 10 L0 -14 L14 10 L28 -6 L34 22Z" fill="#FFD86B" stroke="#E8A928" stroke-width="3" stroke-linejoin="round"/><circle cx="0" cy="-14" r="4" fill="#FF9AC4"/><circle cx="-28" cy="-6" r="3.5" fill="#5ED3C7"/><circle cx="28" cy="-6" r="3.5" fill="#5ED3C7"/></g>
    ${sparkle(30, 200, 1.1, '#FF9AC4')}${sparkle(272, 190, 1.2)}
  </svg>`;
}

// a frame picked at random each time the screen opens
export function faceFrame(kid, photo, letter) {
  return (Math.random() < 0.5 ? porthole : badge)(photo, KID_COLOR[kid], letter);
}
