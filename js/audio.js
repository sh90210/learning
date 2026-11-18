// Audio: recorded clips first (audio/<voice>/manifest.json maps text -> file),
// the tablet's Korean text-to-speech as a fallback.
export const VOICES = {
  playful: { label: '세나 (발랄한 목소리)', pitch: 1.35, rate: 0.95 },
  female: { label: '여자 목소리', pitch: 1.1, rate: 0.9 },
  male: { label: '남자 목소리', pitch: 0.8, rate: 0.9 }
};

let voice = 'playful';
const manifests = {};
let current = null; // { audio?, resolve }
let token = 0;
let koVoice = null;

function loadTTSVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter((v) => (v.lang || '').toLowerCase().startsWith('ko'));
  koVoice = vs.find((v) => /google|samsung/i.test(v.name)) || vs[0] || null;
}
if ('speechSynthesis' in window) {
  loadTTSVoice();
  speechSynthesis.onvoiceschanged = loadTTSVoice;
}

async function manifest(v) {
  if (!manifests[v]) {
    manifests[v] = fetch(`audio/${v}/manifest.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  }
  return manifests[v];
}

export function setVoice(v) { if (VOICES[v]) voice = v; manifest(voice); }
export function getVoice() { return voice; }

export async function hasClip(text, v = voice) { if (typeof text !== 'string') return false; const m = await manifest(v); return !!m[norm(text)]; }
function norm(t) { return t.trim(); }

export function stop() {
  token++;
  if (current) {
    if (current.audio) { current.audio.pause(); current.audio.src = ''; }
    current.resolve();
    current = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function playClip(url, my) {
  return new Promise((resolve) => {
    const a = new Audio(url);
    current = { audio: a, resolve };
    a.onended = () => { if (current && current.audio === a) current = null; resolve(true); };
    a.onerror = () => { if (current && current.audio === a) current = null; resolve(false); };
    a.play().catch(() => resolve(false));
  });
}

function speakTTS(text) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    if (koVoice) u.voice = koVoice;
    u.pitch = VOICES[voice].pitch;
    u.rate = VOICES[voice].rate;
    current = { resolve };
    u.onend = () => { current = null; resolve(true); };
    u.onerror = () => { current = null; resolve(false); };
    speechSynthesis.speak(u);
    // Some engines never fire onend; don't hang forever.
    setTimeout(() => resolve(true), 1500 + text.length * 260);
  });
}

// Say one or more lines in order. A new say() interrupts the previous one.
export async function say(...texts) {
  stop();
  const my = token;
  const m = await manifest(voice);
  for (const t of texts.flat()) {
    if (!t || my !== token) return;
    if (typeof t === 'object') {
      // a picture's sound effect, e.g. { sfx: 'lion' } -> assets/sfx/lion.mp3 (silent if missing)
      if (t.sfx) await playClip(`assets/sfx/${t.sfx}.mp3`, my);
      if (my !== token) return;
      await new Promise((r) => setTimeout(r, 120));
      continue;
    }
    const file = m[norm(t)];
    let ok = false;
    if (file) ok = await playClip(`audio/${voice}/${file}`, my);
    if (my !== token) return;
    if (!ok) await speakTTS(t);
    if (my !== token) return;
    await new Promise((r) => setTimeout(r, 180));
  }
}

// Tiny sound effects with WebAudio (no files needed).
let ctx = null;
export function sfx(kind) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { ok: [660, 880], coin: [988, 1319], bad: [300, 220], pop: [520], star: [784, 988, 1175] }[kind] || [440];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = kind === 'bad' ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t0); o.stop(t0 + 0.25);
    });
  } catch (e) { /* ignore */ }
}

// 태오's recorded lines (English, Nathaniel): audio/theo/<key>.mp3. Silent if missing.
export function theoLine(key) {
  stop();
  const my = ++token;
  return playClip(`audio/theo/${key}.mp3`, my);
}
