// The adaptive part: mastery scores, spaced review, mix-up drills, and the
// lesson builder. Everything here is plain data so a progress report can be
// exported and the rules tuned later.
import { UNITS, ITEM_BY_ID } from './curriculum.js';
import { syllableSimilarity, decompose } from './hangul.js';
import { store } from './store.js';

export const RULES = {
  lessonLength: 8,
  newPerLesson: 3,
  masteredScore: 70,
  unitPassShare: 0.8,
  confusionDrillAt: 3,
  boxIntervalsMin: [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 21]
};

const MIN = 60 * 1000;

export function newProfile(kid) {
  return {
    kid, coins: 0, stickers: [], owned: ['helmet'], equipped: { head: 'helmet' },
    mastery: {}, confusions: {}, unlocked: ['u1'], lessonsDone: 0,
    streakDays: 0, lastDay: null, createdAt: Date.now(), curriculumVersion: 1
  };
}

export async function loadProfile(kid) {
  return (await store.get(`profile:${kid}`)) || newProfile(kid);
}
export function saveProfile(p) { return store.set(`profile:${p.kid}`, p); }

export function m(p, id) {
  return p.mastery[id] || (p.mastery[id] = { score: 0, box: 0, due: 0, seen: 0, correct: 0, last: 0 });
}

export function unitProgress(p, unit) {
  const n = unit.items.length;
  const done = unit.items.filter((it) => (p.mastery[it.id]?.score || 0) >= RULES.masteredScore).length;
  return { done, n, share: n ? done / n : 0 };
}

export function currentUnit(p) {
  for (const u of UNITS) {
    if (!p.unlocked.includes(u.id)) break;
    if (unitProgress(p, u).share < RULES.unitPassShare) return u;
  }
  // Everything unlocked is passed: the last unlocked one.
  return UNITS.find((u) => u.id === p.unlocked[p.unlocked.length - 1]) || UNITS[0];
}

export function checkUnlocks(p) {
  const fresh = [];
  for (let i = 0; i < UNITS.length - 1; i++) {
    const u = UNITS[i], next = UNITS[i + 1];
    if (p.unlocked.includes(u.id) && !p.unlocked.includes(next.id) && unitProgress(p, u).share >= RULES.unitPassShare) {
      p.unlocked.push(next.id);
      fresh.push(next.id);
    }
  }
  return fresh;
}

// ---- choosing activities --------------------------------------------------
function activitiesFor(item, score) {
  if (item.kind === 'syl') {
    if (score < 25) return ['listen', 'build', 'sight'];
    if (score < 55) return ['listen', 'build', 'sight', 'trace'];
    return ['read', 'trace', 'listen', 'build'];
  }
  if (item.kind === 'word') {
    if (score < 30) return ['listen', 'sight'];
    if (score < 60) return ['listen', 'build', 'sight'];
    return ['read', 'build', 'listen'];
  }
  return score < 40 ? ['listen', 'build'] : ['read', 'build', 'listen'];
}

function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

// Distractors: mix-up partners first, then look-alikes, then same unit.
export function distractors(p, item, count) {
  const pool = [];
  const conf = p.confusions[item.id] || {};
  Object.entries(conf).sort((a, b) => b[1] - a[1]).forEach(([id]) => pool.push(id));
  const unit = UNITS.find((u) => u.id === item.unit);
  const sameKind = UNITS.filter((u) => p.unlocked.includes(u.id)).flatMap((u) => u.items).filter((it) => it.kind === item.kind && it.id !== item.id);
  if (item.kind === 'syl') {
    sameKind.map((it) => [it.id, syllableSimilarity(item.text, it.text)])
      .filter(([, s]) => s >= 0.4).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([id]) => pool.push(id));
  }
  shuffle(unit.items.filter((it) => it.id !== item.id)).forEach((it) => pool.push(it.id));
  shuffle(sameKind).forEach((it) => pool.push(it.id));
  const out = [];
  for (const id of pool) { if (!out.includes(id) && id !== item.id) out.push(id); if (out.length >= count) break; }
  return out.map((id) => ITEM_BY_ID[id]);
}

// For "build": which part is missing and what the options are.
export function buildSpec(p, item, nOptions) {
  if (item.kind === 'syl') {
    const parts = item.parts;
    const slot = parts.length === 3 && Math.random() < 0.6 ? 2 : Math.random() < 0.65 ? 1 : 0;
    const unit = UNITS.find((u) => u.id === item.unit);
    const sameSlot = [...new Set(unit.items.filter((it) => it.parts && it.parts[slot]).map((it) => it.parts[slot]))];
    const extra = slot === 1 ? ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'] : slot === 0 ? ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ'] : ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
    const others = shuffle([...new Set([...sameSlot, ...extra])].filter((x) => x !== parts[slot])).slice(0, nOptions - 1);
    return { type: 'jamo', slot, parts, options: shuffle([parts[slot], ...others]) };
  }
  // words: syllable tiles in order; sentences: word tiles in order
  const tiles = item.kind === 'sentence' ? item.text.split(' ') : [...item.text.replace(/ /g, '')];
  let extra = [];
  if (nOptions > 2 && item.kind === 'word') {
    const d = distractors(p, item, 2).flatMap((it) => [...it.text.replace(/ /g, '')]).filter((c) => !tiles.includes(c));
    extra = d.slice(0, 1);
  }
  return { type: 'order', tiles, options: shuffle([...tiles, ...extra]) };
}

function choiceCount(score, struggling) {
  let n = score < 20 ? 2 : score < 50 ? 3 : 4;
  if (struggling) n = Math.max(2, n - 1);
  return n;
}

export function makeStep(p, item, activity, struggling = false) {
  const s = m(p, item.id).score;
  const n = choiceCount(s, struggling);
  const step = { itemId: item.id, activity };
  if (activity === 'listen' || activity === 'sight') {
    step.choices = shuffle([item.id, ...distractors(p, item, n - 1).map((d) => d.id)]);
  } else if (activity === 'build') {
    step.build = buildSpec(p, item, Math.max(3, n));
  } else if (activity === 'drill') {
    step.activity = 'listen';
    step.choices = shuffle([item.id, step.partner]);
  }
  return step;
}

// ---- the lesson builder ----------------------------------------------------
export function buildLesson(p, unitId) {
  const now = Date.now();
  const unit = unitId ? UNITS.find((u) => u.id === unitId) : currentUnit(p);
  const plan = [];
  const used = new Map();
  const add = (item, act, extra = {}) => {
    if (!item) return;
    plan.push({ itemId: item.id, activity: act, ...extra });
    used.set(item.id, (used.get(item.id) || 0) + 1);
  };

  const unseen = unit.items.filter((it) => !p.mastery[it.id] || p.mastery[it.id].seen === 0);
  const fresh = unseen.slice(0, RULES.newPerLesson);
  const known = unit.items.filter((it) => p.mastery[it.id]?.seen > 0);

  // 1) mix-up drill if one is ready
  const unlockedItems = new Set(UNITS.filter((u) => p.unlocked.includes(u.id)).flatMap((u) => u.items.map((i) => i.id)));
  let drill = null;
  for (const [target, chosen] of Object.entries(p.confusions)) {
    if (!unlockedItems.has(target)) continue;
    for (const [other, c] of Object.entries(chosen)) if (c >= RULES.confusionDrillAt && (!drill || c > drill.c)) drill = { target, other, c };
  }

  // 2) new items: an intro, then practice later in the lesson
  for (const it of fresh) add(it, 'intro');

  // 3) due reviews from any unlocked unit, weakest first (about 30%)
  const due = [...unlockedItems].map((id) => ITEM_BY_ID[id])
    .filter((it) => p.mastery[it.id]?.seen > 0 && p.mastery[it.id].due <= now)
    .sort((a, b) => m(p, a.id).score - m(p, b.id).score);
  const reviewSlots = Math.max(2, Math.round(RULES.lessonLength * 0.3));
  due.filter((it) => it.unit !== unit.id).slice(0, reviewSlots).forEach((it) => add(it, null));

  if (drill) add(ITEM_BY_ID[drill.target], 'listen', { partner: drill.other, drill: true });

  // 4) current unit practice: fresh items again, then weakest known
  for (const it of fresh) add(it, null);
  const weak = known.slice().sort((a, b) => m(p, a.id).score - m(p, b.id).score);
  for (const it of weak) { if (plan.length >= RULES.lessonLength - 1) break; if ((used.get(it.id) || 0) < 2) add(it, null); }
  // top up from the unit if it's still short
  for (const it of shuffle(unit.items)) { if (plan.length >= RULES.lessonLength - 1) break; if (!used.has(it.id)) add(it, null); }

  // 5) end on a win: the easiest known item, simple listening
  const easiest = known.slice().sort((a, b) => m(p, b.id).score - m(p, a.id).score)[0] || fresh[0] || unit.items[0];
  add(easiest, 'listen', { easy: true });

  // assign activities with variety (max 3 of a kind, at least one trace / read when eligible)
  const counts = {};
  for (const st of plan) {
    if (st.activity) { counts[st.activity] = (counts[st.activity] || 0) + 1; continue; }
    const item = ITEM_BY_ID[st.itemId];
    const opts = activitiesFor(item, m(p, item.id).score).filter((a) => (counts[a] || 0) < 3);
    const missing = opts.find((a) => (a === 'trace' || a === 'read') && !counts[a]);
    st.activity = missing || opts[Math.floor(Math.random() * opts.length)] || 'listen';
    counts[st.activity] = (counts[st.activity] || 0) + 1;
  }
  return { id: `L${now}`, unit: unit.id, createdAt: now, index: 0, steps: plan, results: [], coinsEarned: 0, combo: 0, wrongRun: 0 };
}

// ---- scoring ---------------------------------------------------------------
// weight: 1 for taps, lower for the microphone (it mishears small children).
export function recordAnswer(p, itemId, { correct, ms = 0, chosen = null, weight = 1 }) {
  const st = m(p, itemId);
  st.seen++;
  st.last = Date.now();
  if (correct) {
    st.correct++;
    const fast = ms > 0 && ms < 4000 ? 1.25 : 1;
    st.score = Math.min(100, st.score + (100 - st.score) * 0.28 * weight * fast + 4 * weight);
    st.box = Math.min(RULES.boxIntervalsMin.length - 1, st.box + 1);
  } else {
    st.score = Math.max(0, st.score - 16 * weight);
    st.box = Math.max(0, st.box - 2);
    if (chosen && chosen !== itemId) {
      const c = p.confusions[itemId] || (p.confusions[itemId] = {});
      c[chosen] = (c[chosen] || 0) + 1;
    }
  }
  if (correct && chosen === null && p.confusions[itemId]) {
    // a clean correct answer slowly forgives old mix-ups
    for (const k of Object.keys(p.confusions[itemId])) p.confusions[itemId][k] = Math.max(0, p.confusions[itemId][k] - 0.5);
  }
  st.due = Date.now() + RULES.boxIntervalsMin[st.box] * MIN;
  st.score = Math.round(st.score * 10) / 10;
  return st;
}

export function markExposure(p, itemId) {
  const st = m(p, itemId);
  if (st.seen === 0) { st.seen = 1; st.score = Math.max(st.score, 5); st.last = Date.now(); st.due = Date.now(); }
}

export function finishLessonDay(p) {
  const today = new Date().toISOString().slice(0, 10);
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (p.lastDay !== today) p.streakDays = p.lastDay === y ? p.streakDays + 1 : 1;
  p.lastDay = today;
  p.lessonsDone++;
}

export { decompose };
