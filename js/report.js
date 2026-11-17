// Progress report (for improving the curriculum) and full backup/restore.
import { store } from './store.js';
import { UNITS, ITEM_BY_ID, CURRICULUM_VERSION } from './curriculum.js';
import { RULES, loadProfile, unitProgress, currentUnit } from './engine.js';

export const APP_VERSION = '1.0.0';

export function lessonMinutes(events) {
  const starts = {};
  let total = 0;
  const byDay = {};
  for (const e of events) {
    if (e.type === 'lesson_start' || e.type === 'lesson_resume') starts[e.lesson] = e.t;
    if (e.type === 'lesson_end' && starts[e.lesson]) {
      const min = Math.min(30, (e.t - starts[e.lesson]) / 60000);
      total += min;
      const d = new Date(e.t).toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + min;
    }
  }
  return { total, byDay };
}

export async function buildReport(kid = 'tay') {
  const p = await loadProfile(kid);
  const events = (await store.allEvents()).filter((e) => e.kid === kid);
  const answers = events.filter((e) => e.type === 'answer' && e.activity !== 'intro');
  const byActivity = {};
  for (const a of answers) {
    const s = byActivity[a.activity] || (byActivity[a.activity] = { tries: 0, correct: 0, avgMs: 0 });
    s.tries++; if (a.correct) s.correct++;
    s.avgMs += a.ms || 0;
  }
  for (const s of Object.values(byActivity)) { s.accuracy = +(s.correct / s.tries).toFixed(2); s.avgMs = Math.round(s.avgMs / s.tries); }
  const time = lessonMinutes(events);
  const confusions = [];
  for (const [target, m] of Object.entries(p.confusions)) for (const [chosen, n] of Object.entries(m)) if (n >= 1) confusions.push({ target: ITEM_BY_ID[target]?.text || target, chosen: ITEM_BY_ID[chosen]?.text || chosen, count: n });
  confusions.sort((a, b) => b.count - a.count);
  return {
    report: 'learning-theo-tay progress report',
    appVersion: APP_VERSION,
    curriculumVersion: CURRICULUM_VERSION,
    exportedAt: new Date().toISOString(),
    kid,
    rules: RULES,
    summary: {
      currentUnit: currentUnit(p).id,
      unlocked: p.unlocked,
      lessonsDone: p.lessonsDone,
      streakDays: p.streakDays,
      coins: p.coins,
      stickers: p.stickers,
      owned: p.owned,
      minutesTotal: Math.round(time.total),
      minutesByDay: Object.fromEntries(Object.entries(time.byDay).map(([d, v]) => [d, Math.round(v)])),
      byActivity
    },
    units: UNITS.map((u) => ({ id: u.id, name: u.name, ...unitProgress(p, u), unlocked: p.unlocked.includes(u.id) })),
    mastery: Object.entries(p.mastery).map(([id, s]) => ({ item: ITEM_BY_ID[id]?.text || id, id, ...s })).sort((a, b) => a.score - b.score),
    confusions,
    events
  };
}

export function download(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export function today() { return new Date().toISOString().slice(0, 10); }

export async function backup() {
  return { backup: 'learning-theo-tay', appVersion: APP_VERSION, exportedAt: new Date().toISOString(), kv: await store.allKV(), events: await store.allEvents() };
}

export async function restore(file) {
  const data = JSON.parse(await file.text());
  if (data.backup !== 'learning-theo-tay') throw new Error('백업 파일이 아니에요');
  await store.replaceAll(data);
}
