// 태오's math practice: skills, question generators, mastery and session building.
// Questions are templates that fill in fresh numbers, so he never sees the same set twice.
// Each generator returns { skill, kind, type, q, note?, pic?, answer, options?, fields?, timed?,
// max?/ok? (number line), explain, tag(value) -> likely mistake or null }.
import { store } from './store.js';
import { SKILLS2, CHAPTERS2, TEACH2 } from './theomath2.js';

const KEY = 'theo:math';
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => Number(n).toLocaleString('en');
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
// choice question with the right option shuffled in
function choice(base, right, wrongs) {
  const options = shuffle([right, ...new Set(wrongs.filter((w) => w !== right))]);
  return { ...base, type: 'choice', options, answer: options.indexOf(right) };
}
const zeroTag = (v, ans) => (v * 10 === ans ? 'lostZero' : v * 100 === ans ? 'lostZeros' : v === ans * 10 ? 'extraZero' : null);

// ---------- pictures ----------
// bundles of ten: g groups of t ten-rods
export function rods(groups, tens, hundreds = false) {
  const w = hundreds ? 34 : 14, h = hundreds ? 34 : 60, gap = hundreds ? 6 : 5;
  const gw = tens * (w + gap) + 18;
  let b = '';
  for (let g = 0; g < groups; g++) {
    const gx = g * (gw + 14);
    b += `<rect x="${gx}" y="0" width="${gw}" height="${h + 18}" rx="12" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.25)" stroke-width="2"/>`;
    for (let t = 0; t < tens; t++) {
      const x = gx + 9 + t * (w + gap);
      b += hundreds
        ? `<rect x="${x}" y="9" width="${w}" height="${h}" rx="3" fill="#FF9AC4" stroke="#fff" stroke-width="1.5"/><path d="M${x + w / 3} 9v${h}M${x + (2 * w) / 3} 9v${h}M${x} ${9 + h / 3}h${w}M${x} ${9 + (2 * h) / 3}h${w}" stroke="rgba(255,255,255,.6)" stroke-width="1"/>`
        : `<rect x="${x}" y="9" width="${w}" height="${h}" rx="3" fill="#FFD86B" stroke="#fff" stroke-width="1.5"/>${Array.from({ length: 9 }, (_, k) => `<line x1="${x}" x2="${x + w}" y1="${9 + ((k + 1) * h) / 10}" y2="${9 + ((k + 1) * h) / 10}" stroke="rgba(0,0,0,.25)" stroke-width="1"/>`).join('')}`;
    }
  }
  const W = groups * (gw + 14);
  return `<svg viewBox="0 0 ${W} ${h + 20}" width="${Math.min(W * 2.6, 900)}" class="pt-pic">${b}</svg>`;
}
// a rectangle split into hundred-squares: (a tens) × (b tens)
export function hundredsGrid(a, b) {
  const s = Math.min(46, Math.floor(320 / Math.max(a, b)));
  let g = '';
  for (let i = 0; i < b; i++) for (let j = 0; j < a; j++) g += `<rect x="${40 + j * s}" y="${30 + i * s}" width="${s - 3}" height="${s - 3}" rx="4" fill="#7B5CFA" opacity=".85"/><text x="${40 + j * s + (s - 3) / 2}" y="${30 + i * s + s / 2 + 2}" text-anchor="middle" font-size="${Math.round(s / 3.2)}" fill="#fff" font-family="Jua">100</text>`;
  return `<svg viewBox="0 0 ${60 + a * s} ${50 + b * s}" width="${60 + a * s}" class="pt-pic">
    <text x="${40 + (a * s) / 2}" y="20" text-anchor="middle" font-size="22" fill="#FFD86B" font-family="Jua">${a * 10}</text>
    <text x="16" y="${30 + (b * s) / 2}" text-anchor="middle" font-size="22" fill="#5ED3C7" font-family="Jua">${b * 10}</text>${g}</svg>`;
}
// number line from lo to hi with ticks every step, a marked value
export function numberLine(lo, hi, step, mark, labelEvery = step) {
  const W = 900, x = (v) => 30 + ((v - lo) / (hi - lo)) * (W - 60);
  let t = '';
  for (let v = lo; v <= hi; v += step) {
    const big = (v - lo) % labelEvery === 0;
    t += `<line x1="${x(v)}" x2="${x(v)}" y1="${big ? 44 : 52}" y2="${big ? 84 : 76}" stroke="#fff" stroke-width="${big ? 4 : 2}"/>`;
    if (big) t += `<text x="${x(v)}" y="114" text-anchor="middle" font-size="26" fill="#FFD86B" font-family="Jua">${fmt(v)}</text>`;
  }
  const m = mark != null ? `<path d="M${x(mark)} 58 l-12 -26 h24z" fill="#FF9AC4"/><text x="${x(mark)}" y="24" text-anchor="middle" font-size="28" fill="#FF9AC4" font-family="Jua">${fmt(mark)}</text>` : '';
  return `<svg viewBox="0 0 ${W} 124" width="${W}" class="pt-pic"><line x1="30" x2="${W - 30}" y1="64" y2="64" stroke="#fff" stroke-width="5"/>${t}${m}</svg>`;
}

// ---------- skills ----------
export const CHAPTERS = [
  { id: 'pot', name: 'Power of Ten', sub: 'Why the zeros are there', color: '#2BB5A8', icon: '🔟', skills: ['x10', 'tens', 'hund', 'tt', 'pattern', 'zfix'] },
  { id: 'bp', name: 'Ballpark', sub: 'How big should it be?', color: '#FF9AC4', icon: '🎯', skills: ['r10', 'r100', 'est', 'digits', 'reason', 'line'] },
  ...CHAPTERS2
];

export const SKILLS = {
  x10: { name: '× 10, × 100, ÷ 10', teach: 'x10', gen() {
    const f = pickOne(['m10', 'm100', 'd10']);
    if (f === 'm10') { const n = R(12, 98); return { kind: 'skill', type: 'num', q: `${n} × 10 = ?`, answer: n * 10, explain: `× 10 moves every digit one place to the left: ${n} → ${fmt(n * 10)}.`, tag: (v) => zeroTag(v, n * 10) }; }
    if (f === 'm100') { const n = R(3, 99); return { kind: 'skill', type: 'num', q: `${n} × 100 = ?`, answer: n * 100, explain: `× 100 moves every digit two places to the left: ${n} → ${fmt(n * 100)}.`, tag: (v) => zeroTag(v, n * 100) }; }
    const n = R(12, 98); return { kind: 'skill', type: 'num', q: `${fmt(n * 10)} ÷ 10 = ?`, answer: n, explain: `÷ 10 moves every digit one place to the right: ${fmt(n * 10)} → ${n}.`, tag: (v) => (v === n * 100 ? 'wrongWay' : null) };
  } },
  tens: { name: 'Tens × ones', teach: 'tens', gen() {
    const a = R(2, 9), b = R(2, 9), ans = a * b * 10;
    if (Math.random() < 0.3) return { kind: 'concept', type: 'num', q: `${a * 10} × ${b} is how many tens?`, unit: 'tens', pic: rods(b, a), answer: a * b, explain: `${a * 10} is ${a} tens. ${b} groups of ${a} tens = ${a * b} tens = ${fmt(ans)}.`, tag: (v) => (v === ans ? 'tensVsNumber' : null) };
    const q = Math.random() < 0.5 ? `${a * 10} × ${b} = ?` : `${b} × ${a * 10} = ?`;
    return { kind: 'skill', type: 'num', q, answer: ans, explain: `${a * 10} is ${a} tens. ${a} tens × ${b} = ${a * b} tens = ${fmt(ans)}.`, picAfter: rods(b, a), tag: (v) => zeroTag(v, ans) };
  } },
  hund: { name: 'Hundreds × ones', teach: 'hund', gen() {
    const a = R(2, 9), b = R(2, 9), ans = a * b * 100;
    return { kind: 'skill', type: 'num', q: Math.random() < 0.5 ? `${a * 100} × ${b} = ?` : `${b} × ${a * 100} = ?`, answer: ans, explain: `${a * 100} is ${a} hundreds. ${a} hundreds × ${b} = ${a * b} hundreds = ${fmt(ans)}.`, tag: (v) => zeroTag(v, ans) };
  } },
  tt: { name: 'Tens × tens', teach: 'tt', gen() {
    // lean on products that end in 0 (5 × 4 = 20) — the trickiest ones
    let a = R(2, 9), b = R(2, 9);
    if (Math.random() < 0.35) { a = 5; b = pickOne([2, 4, 6, 8]); if (Math.random() < 0.5) [a, b] = [b, a]; }
    const ans = a * b * 100;
    if (Math.random() < 0.3) return choice({ kind: 'concept', q: `Which is ${a * 10} × ${b * 10}?`, note: 'Tens × tens makes hundreds.', explain: `${a} × ${b} = ${a * b}, and tens × tens = hundreds: ${a * b} hundreds = ${fmt(ans)}.`, picAfter: hundredsGrid(a, b) }, fmt(ans), [fmt(ans / 10), fmt(ans * 10)]);
    return { kind: 'skill', type: 'num', q: `${a * 10} × ${b * 10} = ?`, answer: ans, explain: `${a} × ${b} = ${a * b}, and tens × tens = hundreds. ${a * b} hundreds = ${fmt(ans)}.`, picAfter: hundredsGrid(a, b), tag: (v) => zeroTag(v, ans) };
  } },
  pattern: { name: 'Patterns of ten', teach: null, gen() {
    let a = R(2, 9), b = R(2, 9);
    if (Math.random() < 0.4) { a = 5; b = pickOne([2, 4, 6, 8]); }
    const ans = [a * b * 10, a * b * 100, a * b * 1000];
    return { kind: 'concept', type: 'multi', q: `${a} × ${b} = ${a * b}. So…`, fields: [`${a * 10} × ${b} =`, `${a * 10} × ${b * 10} =`, `${a * 100} × ${b * 10} =`], answer: ans, explain: `Each extra ten makes the answer 10 times bigger: ${ans.map(fmt).join(' → ')}.`, tag: (v) => (v.some((x, i) => x * 10 === ans[i]) ? 'lostZero' : null) };
  } },
  zfix: { name: 'Spot the zero mistake', teach: null, gen() {
    let a = R(2, 9), b = R(2, 9);
    if (Math.random() < 0.5) { a = 5; b = pickOne([2, 4, 6, 8]); }
    const ans = a * b * 100, claim = ans / 10;
    return choice({ kind: 'concept', q: `Jun says ${a * 10} × ${b * 10} = ${fmt(claim)}. Is he right?`, explain: `${a * 10} × ${b} is already ${fmt(claim)}, so ${a * 10} × ${b * 10} must be 10 times bigger: ${fmt(ans)}.` },
      `No. ${a * 10} × ${b} is already ${fmt(claim)}, so it must be ${fmt(ans)}`, [`Yes. ${a} × ${b} = ${a * b}, then add a zero`, `No. It should be ${fmt(claim / 10)}`, 'Yes. It looks right']);
  } },
  // ---- Ballpark ----
  r10: { name: 'Round to the nearest 10', teach: 'round', gen() {
    const lo = R(12, 98) * 10, d = pickOne([1, 2, 3, 4, 5, 6, 7, 8, 9]), n = lo + d, ans = d >= 5 ? lo + 10 : lo;
    return choice({ kind: 'concept', q: `Round ${n} to the nearest ten.`, pic: numberLine(lo, lo + 10, 1, n, 10), explain: `${n} is between ${lo} and ${lo + 10}. ${d >= 5 ? (d === 5 ? 'Exactly halfway rounds up' : `It's closer to ${lo + 10}`) : `It's closer to ${lo}`}, so it rounds to ${ans}.` },
      String(ans), [String(d >= 5 ? lo : lo + 10), String(n + 10)]);
  } },
  r100: { name: 'Round to the nearest 100', teach: 'round', gen() {
    const lo = R(1, 18) * 100, d = R(1, 99), n = lo + d, ans = d >= 50 ? lo + 100 : lo;
    return choice({ kind: 'concept', q: `Round ${fmt(n)} to the nearest hundred.`, pic: numberLine(lo, lo + 100, 10, n, 50), explain: `${fmt(n)} is between ${fmt(lo)} and ${fmt(lo + 100)}. ${d >= 50 ? `It's past the halfway point (${fmt(lo + 50)})` : `It's before the halfway point (${fmt(lo + 50)})`}, so it rounds to ${fmt(ans)}.` },
      fmt(ans), [fmt(d >= 50 ? lo : lo + 100), fmt(Math.round(n / 10) * 10)]);
  } },
  est: { name: 'Estimate a product', teach: 'est', gen() {
    const A = R(2, 9) * 10, B = R(2, 9) * 10;
    const a = A + pickOne([-2, -1, 1, 2]), b = B + pickOne([-2, -1, 1, 2]), P = A * B;
    if (Math.random() < 0.5) return choice({ kind: 'sense', q: `${a} × ${b} is about…`, note: 'No time to calculate. Round and guess the size!', timed: 10, explain: `Round first: ${a} → ${A}, ${b} → ${B}. ${A} × ${B} = ${fmt(P)}.` }, fmt(P), [fmt(P / 10), fmt(P * 10)]);
    return { kind: 'sense', type: 'multi', q: `Round each number, then multiply: ${a} × ${b} ≈ ?`, fields: [`${a} ≈`, `${b} ≈`, `${A} × ${B} =`], fieldHints: true, answer: [A, B, P], explain: `${a} rounds to ${A} and ${b} rounds to ${B}. ${A} × ${B} = ${fmt(P)}, so ${a} × ${b} is about ${fmt(P)}.`, tag: (v) => (v[2] * 10 === P ? 'lostZero' : null) };
  } },
  digits: { name: 'How many digits?', teach: null, gen() {
    const a = R(120, 899), b = R(12, 89), p = a * b, d = String(p).length;
    return choice({ kind: 'sense', q: `Don't solve it! How many digits will ${a} × ${b} have?`, timed: 12, explain: `${a} is about ${Math.round(a / 100) * 100} and ${b} is about ${Math.round(b / 10) * 10}, so the answer is around ${fmt(Math.round(a / 100) * 100 * Math.round(b / 10) * 10)}. The exact answer, ${fmt(p)}, has ${d} digits.` },
      `${d} digits`, [`${d - 1} digits`, `${d + 1} digits`]);
  } },
  reason: { name: 'Can this be right?', teach: 'reason', gen() {
    const a = R(21, 89), b = R(21, 89), p = a * b, A = Math.round(a / 10) * 10, B = Math.round(b / 10) * 10;
    const kind = pickOne(['ok', 'small', 'big']);
    const claim = kind === 'ok' ? p : kind === 'small' ? Math.round(p / 10) : p * 10;
    const right = kind === 'ok' ? 'Yes, it’s about the right size' : kind === 'small' ? 'No, it’s way too small' : 'No, it’s way too big';
    return choice({ kind: 'sense', q: `Mina says ${a} × ${b} = ${fmt(claim)}. Could that be right?`, note: `Hint: ${a} × ${b} is about ${A} × ${B}.`, explain: `${A} × ${B} = ${fmt(A * B)}. ${kind === 'ok' ? `${fmt(claim)} is close to that, so it could be right (it is: ${fmt(p)}).` : `${fmt(claim)} is ${kind === 'small' ? 'far smaller' : 'far bigger'}, so it can't be right. The answer is ${fmt(p)}.`}` },
      right, ['Yes, it’s about the right size', 'No, it’s way too small', 'No, it’s way too big'].filter((x) => x !== right));
  } },
  line: { name: 'Place it on a number line', teach: null, gen() {
    const a = R(11, 29), b = R(11, 29), p = a * b, max = p > 450 ? 1000 : 500;
    return { kind: 'sense', type: 'line', q: `Tap about where ${a} × ${b} goes.`, note: 'Estimate. Don’t work it out exactly.', max, answer: p, ok: [p * 0.75, p * 1.3], explain: `${a} × ${b} is about ${Math.round(a / 10) * 10} × ${Math.round(b / 10) * 10} = ${fmt(Math.round(a / 10) * 10 * Math.round(b / 10) * 10)}. The exact answer is ${fmt(p)}.` };
  } }
};

// teach cards: a few pages, each { text, pic }
export const TEACH = {
  x10: [{ text: '× 10 makes every digit move one place to the left. Each 1 becomes a 10, each 10 becomes a 100.', pic: () => `<div class="pv-move"><div class="pv-row"><span class="pv-h">hundreds</span><span class="pv-h">tens</span><span class="pv-h">ones</span></div><div class="pv-row"><span></span><span class="pv-d">3</span><span class="pv-d">6</span></div><div class="pv-row arrow">⬇ × 10 ⬇</div><div class="pv-row"><span class="pv-d mv">3</span><span class="pv-d mv">6</span><span class="pv-d zero">0</span></div></div>` },
    { text: 'The 0 holds the ones place, so 36 × 10 = 360. ÷ 10 moves the digits back to the right.', pic: () => '<div class="big-eq">36 × 10 = 360<br>360 ÷ 10 = 36</div>' }],
  tens: [{ text: '30 means 3 tens. Each yellow rod is one ten.', pic: () => rods(1, 3) },
    { text: '30 × 4 means 4 groups of 3 tens.', pic: () => rods(4, 3) },
    { text: 'That’s 12 tens altogether. 12 tens = 120. So 30 × 4 = 120: do 3 × 4 = 12, then remember they’re tens!', pic: () => '<div class="big-eq">3 × 4 = 12<br>3 tens × 4 = 12 tens = 120</div>' }],
  hund: [{ text: '300 means 3 hundreds. Each pink square is one hundred.', pic: () => rods(1, 3, true) },
    { text: '300 × 6 = 6 groups of 3 hundreds = 18 hundreds = 1,800.', pic: () => rods(6, 3, true) }],
  tt: [{ text: '40 × 30 is a rectangle 40 long and 30 tall. Each little square is 10 × 10 = 100.', pic: () => hundredsGrid(4, 3) },
    { text: 'There are 4 × 3 = 12 squares, and each is 100. So 40 × 30 = 12 hundreds = 1,200.', pic: () => '<div class="big-eq">4 × 3 = 12<br>tens × tens = hundreds<br>40 × 30 = 1,200</div>' },
    { text: 'Watch out when the small product already ends in 0: 5 × 4 = 20, so 50 × 40 = 20 hundreds = 2,000. Three zeros!', pic: () => '<div class="big-eq">5 × 4 = 20<br>50 × 40 = 2,000</div>' }],
  round: [{ text: 'Rounding means finding the nearest friendly number. 347 sits between 340 and 350.', pic: () => numberLine(340, 350, 1, 347, 10) },
    { text: '347 is closer to 350, so 347 rounds to 350. If it’s exactly halfway, like 345, we round up.', pic: () => '<div class="big-eq">347 → 350<br>343 → 340<br>345 → 350</div>' }],
  est: [{ text: 'Before a big multiplication, round each number to make an easy one.', pic: () => '<div class="big-eq">31 × 29<br>≈ 30 × 30 = 900</div>' },
    { text: 'Now you know the answer is about 900. If you get 90 or 9,000, something went wrong!', pic: () => '<div class="big-eq">✅ 899<br>❌ 90 &nbsp; ❌ 9,000</div>' }],
  reason: [{ text: 'Always ask: is my answer about the right size? Round, multiply, and compare.', pic: () => '<div class="big-eq">46 × 31 ≈ 50 × 30 = 1,500<br>1,426 ✅ &nbsp; 142 ❌</div>' }]
};

Object.assign(SKILLS, SKILLS2);
Object.assign(TEACH, TEACH2);

// ---------- progress ----------
export async function loadMath() {
  return (await store.get(KEY)) || { skills: {}, tags: {}, facts: {}, sessions: 0, history: [] };
}
export const saveMath = (m) => store.set(KEY, m);
export const sk = (m, id) => (m.skills[id] ||= { score: 0, seen: 0, right: 0, wrong: 0, taught: false, last: 0 });

export function chapterProgress(m, ch) {
  if (!ch.skills) return 0;
  return ch.skills.reduce((s, id) => s + Math.min(100, sk(m, id).score), 0) / (ch.skills.length * 100);
}
// skills open one at a time: the next opens once the last open one has some footing
export function openSkills(m, ch) {
  const open = [];
  for (const id of ch.skills) {
    open.push(id);
    const s = sk(m, id);
    if (s.score < 40 && s.seen < 5) break;
  }
  return open;
}

export function record(m, q, ok, ms, tag) {
  const s = sk(m, q.skill);
  s.seen++; s.last = Date.now();
  if (ok) { s.right++; s.score = Math.min(100, s.score + (ms < 15000 ? 18 : 12)); }
  else { s.wrong++; s.score = Math.max(0, s.score - 10); }
  if (tag) m.tags[tag] = (m.tags[tag] || 0) + 1;
  m.history.push({ at: Date.now(), skill: q.skill, ok, ms, tag: tag || null, q: q.q });
  if (m.history.length > 400) m.history.splice(0, m.history.length - 400);
}

// warm-up facts lean on the slow ones (9s, 6–8s) and any he missed
const FACT_POOL = [];
for (let a = 3; a <= 9; a++) for (let b = 3; b <= 9; b++) FACT_POOL.push([a, b]);
export function warmupFacts(m, n = 5) {
  const w = (f) => { const k = `${Math.min(...f)}x${Math.max(...f)}`; const r = m.facts[k]; return 1 + (f.includes(9) ? 2 : 0) + (r ? (r.miss * 3 + (r.ms > 4000 ? 2 : 0)) : 1); };
  const out = [];
  const pool = [...FACT_POOL];
  while (out.length < n) {
    const tot = pool.reduce((s, f) => s + w(f), 0);
    let x = Math.random() * tot;
    const i = pool.findIndex((f) => (x -= w(f)) <= 0);
    out.push(pool.splice(i < 0 ? 0 : i, 1)[0]);
  }
  return out;
}
export function recordFact(m, a, b, ok, ms) {
  const k = `${Math.min(a, b)}x${Math.max(a, b)}`;
  const r = (m.facts[k] ||= { n: 0, miss: 0, ms: 0 });
  r.n++; if (!ok) r.miss++; r.ms = r.ms ? Math.round(r.ms * 0.6 + ms * 0.4) : ms;
}

// one session: warm-up, then 7 questions from the open skills (newest weighted up), plus a teach card
// before any skill he hasn't been taught
export function buildSession(m, chId) {
  const ch = CHAPTERS.find((c) => c.id === chId);
  const open = openSkills(m, ch);
  const newest = open[open.length - 1];
  const steps = [{ type: 'warmup', facts: warmupFacts(m) }, { type: 'q', skill: 'mental' }];
  const plan = [];
  for (let i = 0; i < 7; i++) {
    const weak = open.filter((id) => sk(m, id).score < 70);
    const id = i % 3 === 0 ? newest : Math.random() < 0.6 && weak.length ? pickOne(weak) : pickOne(open);
    plan.push(id);
  }
  // keep earlier chapters fresh: one review question from a skill he has already practised
  const idx = CHAPTERS.indexOf(ch);
  const earlier = CHAPTERS.slice(0, idx).flatMap((c) => c.skills || []);
  const practised = earlier.filter((id) => sk(m, id).seen > 0);
  if (earlier.length) plan[5] = pickOne(practised.length ? practised : earlier.slice(0, 3));
  const taughtNow = new Set();
  for (const id of plan) {
    const s = sk(m, id), t = SKILLS[id].teach;
    if (t && !s.taught && !taughtNow.has(t) && ch.skills.includes(id)) { steps.push({ type: 'teach', teach: t, skill: id }); taughtNow.add(t); }
    steps.push({ type: 'q', skill: id });
  }
  return { chId, steps, i: 0, results: [], coins: 0, retries: 0 };
}
export function makeQuestion(skill) { return { skill, ...SKILLS[skill].gen() }; }
export function isRightQ(q, v) {
  if (v == null) return false;
  if (q.type === 'multi') return q.answer.every((a, i) => +v[i] === a);
  if (q.type === 'line') return v >= q.ok[0] && v <= q.ok[1];
  return +v === q.answer;
}
export { fmt };
