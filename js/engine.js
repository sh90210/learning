// The adaptive part: mastery scores, spaced review, mix-up drills, and the
// lesson builder. Everything here is plain data so a progress report can be
// exported and the rules tuned later.
import { UNITS, ITEM_BY_ID, STAGE_BY_ID, PICTURE, MAP_ORDER, STORY_BY_ID } from './curriculum.js';
import { syllableSimilarity, decompose } from './hangul.js';
import { store } from './store.js';

export const RULES = {
  lessonLength: 6,
  newPerLesson: 2,
  maxSameActivity: 2,
  masteredScore: 70,
  unitPassShare: 0.8,
  confusionDrillAt: 2,
  boxIntervalsMin: [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 21]
};

const MIN = 60 * 1000;

export function newProfile(kid) {
  return {
    kid, coins: 0, stickers: [], owned: ['helmet'], equipped: { head: 'helmet' },
    mastery: {}, confusions: {}, unlocked: ['c1'], lessonsDone: 0,
    streakDays: 0, lastDay: null, createdAt: Date.now(), curriculumVersion: 1
  };
}

export async function loadProfile(kid) {
  const p = (await store.get(`profile:${kid}`)) || newProfile(kid);
  // renamed shop item from the first version
  p.owned = p.owned.map((id) => (id === 'dino' ? 'dinohat' : id === 'antenna' ? 'antenna' : id));
  for (const k of Object.keys(p.equipped)) if (p.equipped[k] === 'dino') p.equipped[k] = 'dinohat';
  // World 1 (word chapters) replaced the letter-grid planets
  if (!p.unlocked.includes('c1')) p.unlocked.unshift('c1');
  // islands open strictly in order: anything she tapped ahead of time closes again
  syncUnlocked(p);
  return p;
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

export function stageProgress(p, stage) {
  const n = stage.items.length;
  const done = stage.items.filter((it) => (p.mastery[it.id]?.score || 0) >= RULES.masteredScore).length;
  const seen = stage.items.filter((it) => (p.mastery[it.id]?.seen || 0) > 0).length;
  return { done, n, seen, share: n ? done / n : 0 };
}

export function currentStage(p, unit = currentUnit(p)) {
  return unit.stages.find((st) => stageProgress(p, st).share < RULES.unitPassShare) || unit.stages[0];
}

// ---- order: islands (and the stories between them) open one at a time --------
export function stopPassed(p, id) {
  if (STORY_BY_ID[id]) return !!(p.stories && p.stories[id]);
  const u = UNITS.find((x) => x.id === id);
  return !!u && unitProgress(p, u).share >= RULES.unitPassShare;
}
// index in MAP_ORDER of the furthest stop she may open
export function openIndex(p) {
  for (let i = 0; i < MAP_ORDER.length; i++) if (!stopPassed(p, MAP_ORDER[i])) return i;
  return MAP_ORDER.length - 1;
}
export function isOpen(p, id) { const i = MAP_ORDER.indexOf(id); return i >= 0 && i <= openIndex(p); }
export function nextStop(p) { return MAP_ORDER[openIndex(p)]; }
function syncUnlocked(p) {
  const fresh = [];
  const keep = UNITS.filter((u) => isOpen(p, u.id)).map((u) => u.id);
  for (const id of keep) if (!p.unlocked.includes(id)) fresh.push(id);
  p.unlocked = keep.length ? keep : ['c1'];
  return fresh;
}

export function currentUnit(p) {
  const open = UNITS.filter((u) => isOpen(p, u.id));
  return open.find((u) => unitProgress(p, u).share < RULES.unitPassShare) || open[open.length - 1] || UNITS[0];
}

export function checkUnlocks(p) { return syncUnlocked(p); }

// stages inside an island go in order too (the review stage comes last)
export function stageOpen(p, unit, stageId) {
  for (const st of unit.stages) {
    if (st.id === stageId) return true;
    if (stageProgress(p, st).share < RULES.unitPassShare) return false;
  }
  return false;
}

// ---- choosing activities --------------------------------------------------
export const GAMES = ['stars', 'balloon', 'memory', 'connect'];
function activitiesFor(item, score) {
  if (item.kind === 'word' && item.media) {
    // early: lots of picture <-> word matching with the sound as a helper;
    // later: the sound goes away and he has to read the word himself.
    if (score < 25) return ['pickpic', 'connect', 'memory', 'stars', 'pickpic'];
    if (score < 55) return ['pickpic', 'picture', 'stars', 'build', 'connect', 'sound', 'fill', 'memory'];
    if (score < 80) return ['read', 'picture', 'stars', 'fill', 'build', 'sound', 'balloon', 'connect'];
    // nearly mastered: mostly spelling and sounding out, so the score means real reading
    return ['build', 'fill', 'sound', 'read', 'build', 'fill', 'sound', 'picture'];
  }
  if (item.kind === 'syl') {
    if (score < 25) return ['listen', 'stars', 'memory', 'build'];
    if (score < 55) return ['build', 'stars', 'balloon', 'sight', 'trace', 'listen'];
    return ['read', 'trace', 'balloon', 'build', 'stars'];
  }
  if (item.kind === 'word') {
    if (score < 30) return ['listen', 'memory', 'stars'];
    if (score < 60) return ['fill', 'build', 'balloon', 'listen'];
    return ['read', 'fill', 'build'];
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
  if (['listen', 'sight', 'stars', 'picture', 'pickpic', 'sound'].includes(activity)) {
    const k = ['stars', 'pickpic', 'sound'].includes(activity) ? Math.max(3, n) : n;
    step.choices = shuffle([item.id, ...distractors(p, item, k - 1).map((d) => d.id)]);
  } else if (activity === 'balloon') {
    // 2–3 balloons carry the target, the rest are look-alikes
    const copies = struggling ? 2 : 3;
    const others = distractors(p, item, 3).map((d) => d.id);
    step.choices = shuffle([...Array(copies).fill(item.id), ...others]);
  } else if (activity === 'memory') {
    step.pairs = [item.id, ...distractors(p, item, struggling ? 1 : 2).map((d) => d.id)];
    // words with pictures: one word card + one picture card per pair
    step.cards = item.media ? shuffle(step.pairs.flatMap((id) => [`w|${id}`, `p|${id}`])) : shuffle([...step.pairs, ...step.pairs]);
  } else if (activity === 'connect') {
    const ids = [item.id, ...distractors(p, item, struggling || s < 20 ? 2 : 3).map((d) => d.id)];
    step.words = shuffle(ids);
    step.pics = shuffle(ids);
  } else if (activity === 'fill') {
    const syl = [...item.text.replace(/ /g, '')];
    const at = Math.floor(Math.random() * syl.length);
    const pool = [...new Set(ALL_SYL.filter((t) => t !== syl[at]))];
    const near = pool.map((t) => [t, syllableSimilarity(syl[at], t)]).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([t]) => t);
    step.fill = { at, answer: syl[at], options: shuffle([syl[at], ...shuffle(near).slice(0, Math.max(2, n - 1))]) };
  } else if (activity === 'build') {
    step.build = buildSpec(p, item, Math.max(3, n));
  }
  return step;
}
const ALL_SYL = [...new Set(UNITS.flatMap((u) => u.items).flatMap((it) => [...it.text.replace(/ /g, '')]))];

// ---- the lesson builder ----------------------------------------------------
// A lesson is short (6 steps): new blocks from the chosen stage, one review
// from earlier, a mix-up drill when one is due, practice, and an easy finish.
export function buildLesson(p, unitId, stageId) {
  const now = Date.now();
  const unit = unitId ? UNITS.find((u) => u.id === unitId) : currentUnit(p);
  const stage = (stageId && STAGE_BY_ID[stageId] && stageOpen(p, unit, stageId) && STAGE_BY_ID[stageId]) || currentStage(p, unit);
  const LEN = RULES.lessonLength;
  const plan = [];
  const used = new Map();
  const add = (item, act, extra = {}) => {
    if (!item || plan.length >= LEN) return;
    plan.push({ itemId: item.id, activity: act, ...extra });
    used.set(item.id, (used.get(item.id) || 0) + 1);
  };
  const pool = stage.items;
  const fresh = pool.filter((it) => !p.mastery[it.id] || p.mastery[it.id].seen === 0).slice(0, RULES.newPerLesson);
  const known = pool.filter((it) => p.mastery[it.id]?.seen > 0);
  const seenAll = Object.keys(p.mastery).filter((id) => ITEM_BY_ID[id] && p.mastery[id].seen > 0);

  let drill = null;
  for (const [target, chosen] of Object.entries(p.confusions)) {
    if (!ITEM_BY_ID[target]) continue;
    for (const [other, c] of Object.entries(chosen)) if (ITEM_BY_ID[other] && c >= RULES.confusionDrillAt && (!drill || c > drill.c)) drill = { target, other, c };
  }

  for (const it of fresh) add(it, 'intro');
  const due = seenAll.map((id) => ITEM_BY_ID[id])
    .filter((it) => it.stage !== stage.id && p.mastery[it.id].due <= now)
    .sort((a, b) => m(p, a.id).score - m(p, b.id).score);
  due.slice(0, fresh.length ? 1 : 2).forEach((it) => add(it, null));
  if (drill) add(ITEM_BY_ID[drill.target], 'listen', { partner: drill.other, drill: true });
  for (const it of fresh) if (plan.length < LEN - 1) add(it, null);
  const weak = known.slice().sort((a, b) => m(p, a.id).score - m(p, b.id).score);
  for (const it of weak) if (plan.length < LEN - 1 && (used.get(it.id) || 0) < 2) add(it, null);
  for (let round = 0; round < 2 && plan.length < LEN - 1; round++) {
    for (const it of shuffle(pool)) if (plan.length < LEN - 1 && (used.get(it.id) || 0) <= round) add(it, null);
  }
  const easiest = known.slice().sort((a, b) => m(p, b.id).score - m(p, a.id).score)[0] || fresh[0] || pool[0];
  plan.push({ itemId: easiest.id, activity: 'stars', easy: true });

  // give each step an activity: variety, at least one game, a trace/read when ready
  const counts = {};
  const bump = (a) => { counts[a] = (counts[a] || 0) + 1; };
  plan.forEach((st) => { if (st.activity) bump(st.activity); });
  for (const st of plan) {
    if (st.activity) continue;
    const item = ITEM_BY_ID[st.itemId];
    const opts = activitiesFor(item, m(p, item.id).score).filter((a) => (counts[a] || 0) < RULES.maxSameActivity);
    const wanted = opts.find((a) => (a === 'trace' || a === 'read') && !counts[a]) || (GAMES.some((g) => counts[g]) ? null : opts.find((g) => GAMES.includes(g)));
    st.activity = wanted || opts[Math.floor(Math.random() * opts.length)] || 'listen';
    bump(st.activity);
  }
  return { id: `L${now}`, unit: unit.id, stage: stage.id, createdAt: now, index: 0, steps: plan, results: [], coinsEarned: 0, combo: 0, bestCombo: 0, wrongRun: 0 };
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
