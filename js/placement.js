// 태오's math placement check (English). Two sittings, 45 questions.
// Measures concept and skill separately per topic, plus number sense
// (does he know how big an answer should be, and does he catch his own slips?).
// No right/wrong feedback during the test. Results live in 어른용.
import { app, html, mount, on, $, $$, esc, burst } from './ui.js';
import { sfx, stop, theoLine } from './audio.js';
import { store } from './store.js';
import { loadTheo, addCoins, coinChip, locker } from './locker.js';
import { ballon, celebrate, SHOP_BY_ID } from './ballon.js';
import { trainHome } from './theotrain.js';

const KEY = 'theo:placement';
export const TOPICS = {
  place: '자릿값 · 어림 (Place value)',
  addsub: '덧셈 · 뺄셈 (Add & subtract)',
  meaning: '곱셈의 의미 (What × means)',
  facts: '구구단 (Times-table facts)',
  sense: '수 감각 (How big should it be?)',
  big: '큰 수의 곱셈 (Multi-digit ×)',
  word: '문장제 (Word problems)',
  division: '나눗셈 (Division)',
  fractions: '분수 (Fractions)',
  puzzles: '퍼즐 (Puzzles)'
};

// ---------- pictures ----------
const dot = (x, y, r = 9, c = '#FFD86B') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="pt-pic">${body}</svg>`;
function groups(n, k) {
  let b = '';
  for (let g = 0; g < n; g++) {
    const gx = 20 + g * 130;
    b += `<rect x="${gx}" y="10" width="110" height="110" rx="20" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" stroke-width="3"/>`;
    for (let i = 0; i < k; i++) b += dot(gx + 30 + (i % 3) * 25, 45 + Math.floor(i / 3) * 40, 10);
  }
  return svg(20 + n * 130, 130, b);
}
function array(r, c, s = 34) {
  let b = '';
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) b += dot(20 + j * s, 20 + i * s, 11, '#5ED3C7');
  return svg(c * s + 10, r * s + 10, b);
}
function grid(r, c, s = 44) {
  let b = '';
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) b += `<rect x="${4 + j * s}" y="${4 + i * s}" width="${s - 4}" height="${s - 4}" rx="6" fill="#7B5CFA" opacity=".85"/>`;
  return svg(c * s + 8, r * s + 8, b);
}
function ropes() {
  return svg(640, 130, `<text x="0" y="40" fill="#FF9AC4" font-size="26" font-family="Jua">red</text><rect x="80" y="22" width="120" height="18" rx="9" fill="#FF6B6B"/><text x="210" y="40" fill="#fff" font-size="24" font-family="Jua">4 cm</text>
    <text x="0" y="105" fill="#9EC5FF" font-size="26" font-family="Jua">blue</text><rect x="80" y="87" width="360" height="18" rx="9" fill="#4D8BFF"/><text x="450" y="105" fill="#fff" font-size="24" font-family="Jua">? cm</text>`);
}
function cookies(n, plates) {
  let b = '';
  for (let i = 0; i < n; i++) b += `<circle cx="${30 + i * 46}" cy="34" r="18" fill="#D9A066" stroke="#8B5A2B" stroke-width="3"/>${dot(24 + i * 46, 30, 3, '#5A3A1A')}${dot(36 + i * 46, 40, 3, '#5A3A1A')}`;
  if (plates) for (let p = 0; p < plates; p++) b += `<ellipse cx="${90 + p * 180}" cy="110" rx="70" ry="18" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="3"/><text x="${90 + p * 180}" y="160" text-anchor="middle" font-size="22" fill="#B9C0E8" font-family="Jua">kid ${p + 1}</text>`;
  return svg(Math.max(n * 46 + 20, 560), plates ? 170 : 70, b);
}
// fraction pictures
function pie(parts, shaded, equal = true) {
  let b = '<circle cx="70" cy="70" r="62" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-width="4"/>';
  const angles = equal ? Array.from({ length: parts + 1 }, (_, i) => (i * 2 * Math.PI) / parts) : [0, 2.4, 3.6, 4.9, 2 * Math.PI];
  for (let i = 0; i < angles.length - 1; i++) {
    const a0 = angles[i] - Math.PI / 2, a1 = angles[i + 1] - Math.PI / 2;
    const p = `M70 70 L${70 + 62 * Math.cos(a0)} ${70 + 62 * Math.sin(a0)} A62 62 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${70 + 62 * Math.cos(a1)} ${70 + 62 * Math.sin(a1)}Z`;
    b += `<path d="${p}" fill="${i < shaded ? '#FFD86B' : 'transparent'}" stroke="#fff" stroke-width="4"/>`;
  }
  return svg(140, 140, b);
}
function bar(parts, shaded, widths) {
  const ws = widths || Array(parts).fill(240 / parts);
  let x = 4, b = '';
  ws.forEach((w, i) => { b += `<rect x="${x}" y="4" width="${w}" height="70" fill="${i < shaded ? '#FFD86B' : 'rgba(255,255,255,.1)'}" stroke="#fff" stroke-width="4"/>`; x += w; });
  return svg(250, 80, b);
}
const candies = (n) => svg(n * 52 + 10, 60, Array.from({ length: n }, (_, i) => `<circle cx="${30 + i * 52}" cy="30" r="20" fill="${['#FF6B6B', '#FFD86B', '#5ED3C7', '#9EC5FF'][i % 4]}"/>`).join(''));
function areaBlank() {
  return svg(560, 330, `<g font-family="Jua" font-size="28" fill="#fff" text-anchor="middle">
    <text x="190" y="28" fill="#FFD86B">20</text><text x="440" y="28" fill="#FFD86B">3</text>
    <text x="22" y="130" fill="#5ED3C7">10</text><text x="22" y="270" fill="#5ED3C7">4</text>
    <rect x="50" y="44" width="300" height="170" rx="6" fill="#7B5CFA" opacity=".8"/><text x="200" y="138">A</text>
    <rect x="356" y="44" width="160" height="170" rx="6" fill="#FF9AC4" opacity=".8"/><text x="436" y="138">B</text>
    <rect x="50" y="220" width="300" height="100" rx="6" fill="#2BB5A8" opacity=".8"/><text x="200" y="280">C</text>
    <rect x="356" y="220" width="160" height="100" rx="6" fill="#FFB347" opacity=".85"/><text x="436" y="280">D</text></g>`);
}
// a worked column multiplication, used for spot-the-mistake
const worked = (rows) => `<div class="pt-worked">${rows.map((r) => `<div class="${r.cls || ''}">${r.t}</div>`).join('')}</div>`;

// ---------- the questions ----------
// type: num | multi | choice | line | facts
// kind: concept | skill. group: questions in a group run easy -> hard; 2 misses in a row skip the rest.
// timed: seconds (number-sense "no time to calculate" questions). check: ask "is your answer right?". how: ask how he solved it.
export const PARTS = [
  {
    title: 'Part 1 · Numbers and multiplication',
    questions: [
      { id: 'pv1', topic: 'place', kind: 'concept', type: 'choice', q: 'In the number 347, what does the 4 stand for?', options: ['4', '40', '400', '4 + 7'], answer: 1 },
      { id: 'pv2', topic: 'place', kind: 'skill', type: 'num', q: '36 × 10 = ?', answer: 360, group: 'pv' },
      { id: 'pv3', topic: 'place', kind: 'skill', type: 'num', q: '360 ÷ 10 = ?', answer: 36, group: 'pv' },
      { id: 'pv4', topic: 'place', kind: 'concept', type: 'num', q: 'Round 347 to the nearest ten.', answer: 350 },
      { id: 'as1', topic: 'addsub', kind: 'skill', type: 'num', q: '458 + 276 = ?', answer: 734, group: 'as' },
      { id: 'as2', topic: 'addsub', kind: 'skill', type: 'num', q: '702 − 365 = ?', answer: 337, group: 'as' },
      { id: 'as3', topic: 'addsub', kind: 'concept', type: 'num', q: '72 − 68 = ?', note: 'Try it in your head!', answer: 4, how: true },
      { id: 'as4', topic: 'addsub', kind: 'concept', type: 'choice', q: 'Which one has the same answer as 503 − 198?', note: 'You don’t need to solve it.', options: ['505 − 200', '503 − 200', '501 − 200', '500 − 198'], answer: 0 },
      { id: 'mm1', topic: 'meaning', kind: 'concept', type: 'choice', q: 'Which one matches the picture?', pic: () => groups(4, 6), options: ['4 + 6', '6 + 6 + 6 + 6', '4 + 4 + 4 + 4', '6 × 6'], answer: 1 },
      { id: 'mm2', topic: 'meaning', kind: 'concept', type: 'choice', q: 'Is 3 × 8 the same as 8 × 3? Why?', pic: () => array(3, 8), options: ['Yes. Turn the dots sideways and it’s the same dots.', 'Yes, because 3 + 8 = 8 + 3.', 'No. 8 × 3 is bigger.', 'No. They are different groups.'], answer: 0 },
      { id: 'mm3', topic: 'meaning', kind: 'concept', type: 'num', q: 'The blue rope is 3 times as long as the red rope. How long is the blue rope?', pic: ropes, unit: 'cm', answer: 12 },
      { id: 'mm4', topic: 'meaning', kind: 'concept', type: 'choice', q: 'Which story matches 5 × 7?', options: ['5 bags with 7 apples in each bag', 'I have 5 apples and 7 oranges', 'I had 7 apples and ate 5', '35 apples shared by 5 friends'], answer: 0 },
      { id: 'mm5', topic: 'meaning', kind: 'skill', type: 'num', q: 'How many squares? (Count fast!)', pic: () => grid(4, 6), answer: 24, how: true },
      { id: 'mm6', topic: 'meaning', kind: 'concept', type: 'choice', q: 'You forgot 7 × 8. Which one helps you find it?', options: ['7 × 4 = 28, then double it', '7 + 8 = 15', '7 × 10 = 70, then add 8', '8 × 8 = 64, then add 7'], answer: 0 },
      { id: 'ff', topic: 'facts', kind: 'skill', type: 'facts', q: 'Times-table sprint! Answer as fast as you can.', facts: [[6, 7], [8, 4], [9, 6], [7, 8], [3, 9], [6, 8], [4, 7], [9, 9], [7, 7], [8, 9]] },
      { id: 'ns1', topic: 'sense', kind: 'concept', type: 'choice', q: '50 × 40 is about…', note: 'No time to calculate. Just guess the size!', options: ['200', '2,000', '20,000'], answer: 1, timed: 8 },
      { id: 'ns2', topic: 'sense', kind: 'concept', type: 'choice', q: '31 × 29 is about…', note: 'No time to calculate. Just guess the size!', options: ['90', '900', '9,000'], answer: 1, timed: 8 },
      { id: 'ns3', topic: 'sense', kind: 'concept', type: 'multi', q: '5 × 4 = 20. So…', fields: ['50 × 4 =', '50 × 40 =', '500 × 40 ='], answer: [200, 2000, 20000] },
      { id: 'ns4', topic: 'sense', kind: 'concept', type: 'choice', q: 'Don’t solve it! How many digits will the answer to 347 × 26 have?', options: ['3 digits', '4 digits', '5 digits'], answer: 1, timed: 12 },
      { id: 'bm1', topic: 'big', kind: 'skill', type: 'num', q: '30 × 4 = ?', answer: 120, group: 'bmA' },
      { id: 'bm2', topic: 'big', kind: 'skill', type: 'num', q: '40 × 30 = ?', answer: 1200, group: 'bmA' },
      { id: 'bm3', topic: 'big', kind: 'skill', type: 'num', q: '47 × 6 = ?', answer: 282, group: 'bmA', check: true, how: true }
    ]
  },
  {
    title: 'Part 2 · Big multiplication, division, fractions',
    questions: [
      { id: 'bm4', topic: 'big', kind: 'skill', type: 'num', q: '23 × 14 = ?', answer: 322, group: 'bmB', check: true },
      { id: 'bm5', topic: 'big', kind: 'skill', type: 'num', q: '347 × 26 = ?', answer: 9022, group: 'bmB', check: true, how: true },
      { id: 'bm6', topic: 'big', kind: 'concept', type: 'multi', q: 'This rectangle shows 23 × 14. What number goes in each part?', pic: areaBlank, fields: ['A =', 'B =', 'C =', 'D ='], answer: [200, 30, 80, 12] },
      { id: 'bm7', topic: 'big', kind: 'concept', type: 'choice', q: 'Jun solved 347 × 26 like this and got 2,776. What went wrong?',
        pic: () => worked([{ t: '347' }, { t: '× 26', cls: 'op' }, { t: '2082', cls: 'line' }, { t: '694' }, { t: '2776', cls: 'line' }]),
        options: ['The 694 should be 6,940, because it is 347 × 20', '7 × 6 should be 48', 'He forgot to carry a 1', 'Nothing. 2,776 is right'], answer: 0 },
      { id: 'ns5', topic: 'sense', kind: 'concept', type: 'choice', q: 'Mina says 50 × 40 = 200. Is she right?', options: ['Right. 5 × 4 = 20, then add a zero', 'Wrong. 50 × 4 is already 200, so 50 × 40 must be bigger', 'Wrong. It should be 90', 'Right. It looks fine'], answer: 1 },
      { id: 'ns6', topic: 'sense', kind: 'concept', type: 'choice', q: 'Jun says 347 × 26 = 902. Could that be right?', options: ['No. 350 × 25 is about 8,750, so 902 is way too small', 'Yes. 3 digits times 2 digits gives 3 digits', 'No. It should be more than 100,000', 'Yes. It looks right'], answer: 0 },
      { id: 'ns7', topic: 'sense', kind: 'concept', type: 'line', q: 'Tap about where 23 × 14 is on the number line.', note: 'Don’t work it out exactly. Just think about the size.', max: 1000, answer: 322, ok: [230, 420] },
      { id: 'bm8', topic: 'big', kind: 'concept', type: 'choice', q: 'What’s the easiest way to do 25 × 48 in your head?', options: ['Double one, halve the other: 50 × 24 = 100 × 12', 'Write it out with the column method', '25 + 48', '20 × 40 + 5 × 8'], answer: 0 },
      { id: 'wp1', topic: 'word', kind: 'skill', type: 'num', q: 'A space station has 16 rockets. Each rocket carries 136 fuel tanks. How many fuel tanks are there in all?', unit: 'tanks', answer: 2176, check: true },
      { id: 'wp2', topic: 'word', kind: 'concept', type: 'num', q: 'Mina has 24 stickers. Jun has 3 times as many stickers as Mina. How many stickers does Jun have?', unit: 'stickers', answer: 72 },
      { id: 'dv1', topic: 'division', kind: 'concept', type: 'num', q: '12 cookies are shared equally by 3 kids. How many cookies does each kid get?', pic: () => cookies(12, 3), answer: 4, group: 'dvA' },
      { id: 'dv2', topic: 'division', kind: 'concept', type: 'num', q: 'You have 12 cookies. You put 4 cookies in each bag. How many bags do you need?', pic: () => cookies(12), answer: 3, group: 'dvA' },
      { id: 'dv3', topic: 'division', kind: 'concept', type: 'choice', q: 'Which division matches this?', note: '20 − 5 − 5 − 5 − 5 = 0', options: ['20 ÷ 5 = 4', '20 − 5 = 15', '5 × 20 = 100', '20 + 5 = 25'], answer: 0, group: 'dvA' },
      { id: 'dv4', topic: 'division', kind: 'skill', type: 'num', q: '6 × 7 = 42. So 42 ÷ 7 = ?', answer: 6, group: 'dvB' },
      { id: 'dv5', topic: 'division', kind: 'skill', type: 'multi', q: '17 ÷ 5 = ?', note: 'What’s left over is the remainder.', fields: ['answer', 'remainder'], answer: [3, 2], group: 'dvB' },
      { id: 'dv6', topic: 'division', kind: 'concept', type: 'num', q: '26 kids are going on a trip. Each car holds 4 kids. How many cars do they need?', unit: 'cars', answer: 7, group: 'dvB' },
      { id: 'dv7', topic: 'division', kind: 'skill', type: 'num', q: '84 ÷ 4 = ?', answer: 21, group: 'dvC', how: true },
      { id: 'dv8', topic: 'division', kind: 'skill', type: 'num', q: '156 ÷ 12 = ?', note: 'This one is a challenge!', answer: 13, group: 'dvC' },
      { id: 'fr1', topic: 'fractions', kind: 'concept', type: 'choice', q: 'Which picture shows one fourth (¼) colored?', pics: [() => pie(4, 1, false), () => pie(4, 1), () => pie(3, 1), () => bar(4, 2)], options: ['A', 'B', 'C', 'D'], answer: 1, group: 'fr' },
      { id: 'fr2', topic: 'fractions', kind: 'concept', type: 'num', q: 'What is half of 8 candies?', pic: () => candies(8), unit: 'candies', answer: 4, group: 'fr' },
      { id: 'fr3', topic: 'fractions', kind: 'concept', type: 'choice', q: 'Which is bigger: ½ of a pizza or ¼ of the same pizza?', pics: [() => pie(2, 1), () => pie(4, 1)], options: ['½ is bigger', '¼ is bigger', 'They are the same'], answer: 0, group: 'fr' },
      { id: 'fr4', topic: 'fractions', kind: 'concept', type: 'choice', q: 'What part of the bar is colored?', pic: () => bar(4, 3), options: ['¾', '¼', '3', '⁴⁄₃'], answer: 0, group: 'fr' },
      { id: 'pz1', topic: 'puzzles', kind: 'concept', type: 'num', q: 'What digit is missing?  2? × 3 = 72', answer: 4 }
    ]
  }
];
export const ALL_Q = PARTS.flatMap((p) => p.questions);

// ---------- state ----------
export async function loadPlacement() {
  return (await store.get(KEY)) || { parts: [{ answers: {}, done: false }, { answers: {}, done: false }] };
}
const savePlacement = (s) => store.set(KEY, s);
export async function resetPlacement() { await store.set(KEY, null); }

function isRight(q, a) {
  if (!a || a.skipped || a.dontKnow || a.timeout) return false;
  if (q.type === 'facts') return a.correct >= 8;
  if (q.type === 'multi') return q.answer.every((v, i) => +a.value[i] === v);
  if (q.type === 'line') return a.value >= q.ok[0] && a.value <= q.ok[1];
  return +a.value === q.answer;
}
export { isRight };

// ---------- screens ----------
export async function theoHome(quiet = false) {
  stop();
  const s = await loadPlacement();
  // once both parts are done, 태오's home is his training
  if (s.parts[0].done && s.parts[1].done) return trainHome(() => app.go('entry'));
  const tp = await loadTheo();
  const card = (i) => {
    const p = PARTS[i], st = s.parts[i];
    const n = Object.keys(st.answers).length, total = p.questions.length;
    const status = st.done ? '✓ Done!' : n ? `${n} of ${total} done. Keep going!` : `${total} questions`;
    const locked = i === 1 && !s.parts[0].done;
    return `<button class="pt-part ${st.done ? 'done' : ''} ${locked ? 'locked' : ''}" data-part="${i}">
      <span class="pt-num">${i + 1}</span><span class="pt-ptitle">${esc(p.title.split(' · ')[1])}</span><span class="pt-status">${locked ? 'After Part 1' : status}</span></button>`;
  };
  const el = mount(html(`<section class="screen pt">
    <div class="row"><button class="round back" aria-label="Back">←</button><h1 class="title" style="font-size:60px;margin:0 auto">Theo's Math Check</h1>${coinChip(tp.coins)}</div>
    <div class="pt-homewrap">
      <div class="pt-ballon"><div class="pt-bwrap">${ballon({ equipped: tp.equipped, size: 230 })}</div>
        <button class="big-btn pt-locker">Ballon's Locker</button></div>
      <div class="pt-right">
        <p class="pt-lead">Let's see what you already know! There are two parts.<br>Do your best, and it's OK to say "I don't know."<br><b class="pt-earn">Every answer earns ⚽ 5. Finishing a part earns ⚽ 50!</b></p>
        <div class="pt-parts">${card(0)}${card(1)}</div>
      </div>
    </div>
  </section>`));
  if (!quiet) theoLine(Object.keys(s.parts[0].answers).length ? 'welcome_back' : 'welcome');
  on(el, '.back', () => { stop(); app.go('entry'); });
  on(el, '.pt-locker', () => { sfx('pop'); locker(() => theoHome(true)); });
  on(el, '.pt-bwrap', () => celebrate($(el, '.pt-bwrap .ballon'), SHOP_BY_ID[tp.equipped.celebrate].cel));
  on(el, '.pt-part', (b) => {
    if (b.classList.contains('locked')) { sfx('bad'); return; }
    const i = +b.dataset.part;
    if (s.parts[i].done) { sfx('pop'); return; }
    sfx('pop');
    paperScreen(i);
  });
}

function paperScreen(i) {
  const el = mount(html(`<section class="screen pt center-col">
    <div class="pt-paper">✏️📄</div>
    <h2 class="pt-h2">Get a pencil and paper first!</h2>
    <p class="pt-lead">Use them to work things out.<br>Some questions are timed. For those, don't calculate, just guess how big the answer is.</p>
    <button class="big-btn pt-go">I'm ready!</button>
  </section>`));
  theoLine('paper');
  on(el, '.pt-go', () => { sfx('ok'); theoLine(i === 0 ? 'part1' : 'part2'); runPart(i); });
}

async function runPart(pi) {
  const s = await loadPlacement();
  const part = PARTS[pi], st = s.parts[pi];
  const qs = part.questions;
  let idx = qs.findIndex((q) => !st.answers[q.id]);
  if (idx < 0) idx = qs.length;
  const missStreak = {};
  // rebuild skip streaks from saved answers
  for (const q of qs) if (q.group && st.answers[q.id]) missStreak[q.group] = isRight(q, st.answers[q.id]) ? 0 : (missStreak[q.group] || 0) + 1;

  async function record(q, a) {
    a.at = Date.now();
    if (!a.skipped) await addCoins(5);
    st.answers[q.id] = a;
    if (q.group) missStreak[q.group] = isRight(q, a) ? 0 : (missStreak[q.group] || 0) + 1;
    await savePlacement(s);
    idx++;
    next();
  }
  async function next() {
    // skip the rest of a group after 2 misses in a row
    while (idx < qs.length && qs[idx].group && (missStreak[qs[idx].group] || 0) >= 2) {
      st.answers[qs[idx].id] = { skipped: true };
      idx++;
    }
    await savePlacement(s);
    if (idx >= qs.length) {
      st.done = true;
      await savePlacement(s);
      await addCoins(50);
      return finishPart(pi);
    }
    showQuestion(pi, idx, qs, record);
  }
  next();
}

async function finishPart(pi) {
  sfx('star');
  const tp = await loadTheo();
  const el = mount(html(`<section class="screen pt center-col">
    <div class="pt-bwrap">${ballon({ equipped: tp.equipped, size: 200 })}</div>
    <h1 class="title" style="font-size:72px">Great work, Theo! 🚀</h1>
    <p class="pt-lead">${coinChip(tp.coins)}</p>
    <p class="pt-lead">${pi === 0 ? 'Part 1 is done. Take a break, and do Part 2 later.' : 'You finished the whole Math Check! Thank you!'}</p>
    <button class="big-btn pt-go">OK</button>
  </section>`));
  burst($(el, '.screen') || el, 24);
  setTimeout(() => celebrate($(el, '.pt-bwrap .ballon'), SHOP_BY_ID[tp.equipped.celebrate].cel), 300);
  theoLine(pi === 0 ? 'part1_done' : 'all_done');
  on(el, '.pt-go', () => theoHome(true));
}

// ---------- one question ----------
const KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3];
const keypad = (extra = '') => `<div class="pt-keys">${KEYS.map((n) => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="del" class="del">⌫</button><button data-k="0">0</button>${extra || '<button data-k="ok" class="ok">OK</button>'}</div>`;

function showQuestion(pi, i, qs, record) {
  const q = qs[i];
  const t0 = Date.now();
  if (q.timed) theoLine('timed');
  else if (q.type === 'facts') theoLine('sprint');
  else if (i === Math.floor(qs.length / 2)) theoLine('halfway');
  const top = `<div class="pt-top"><button class="round pt-home" aria-label="Save and leave">✕</button>
    <div class="pt-bar"><i style="width:${(i / qs.length) * 100}%"></i></div><span class="pt-count">${i + 1} / ${qs.length}</span></div>`;
  const pic = q.pic ? `<div class="pt-picbox">${q.pic()}</div>` : '';
  const note = q.note ? `<p class="pt-note">${esc(q.note)}</p>` : '';
  const idk = `<button class="pt-idk">I don't know</button>`;
  let answerArea = '';
  if (q.type === 'choice') {
    answerArea = q.pics
      ? `<div class="pt-picchoices">${q.pics.map((p, k) => `<button class="pt-pc" data-i="${k}"><span>${q.options[k]}</span>${p()}</button>`).join('')}</div>`
      : `<div class="pt-choices">${q.options.map((o, k) => `<button class="pt-opt" data-i="${k}"><b>${'ABCD'[k]}</b>${esc(o)}</button>`).join('')}</div>`;
  } else if (q.type === 'num') {
    answerArea = `<div class="pt-entry"><div class="pt-field cur" data-f="0"></div>${q.unit ? `<span class="pt-unit">${esc(q.unit)}</span>` : ''}</div>${keypad()}`;
  } else if (q.type === 'multi') {
    answerArea = `<div class="pt-multi">${q.fields.map((f, k) => `<label><span>${esc(f)}</span><div class="pt-field ${k === 0 ? 'cur' : ''}" data-f="${k}"></div></label>`).join('')}</div>${keypad()}`;
  } else if (q.type === 'line') {
    answerArea = `<div class="pt-line"><svg viewBox="0 0 1000 120" width="1000" height="120">
      <line x1="40" y1="60" x2="960" y2="60" stroke="#fff" stroke-width="5"/>
      ${Array.from({ length: 11 }, (_, k) => `<line x1="${40 + k * 92}" y1="${k % 5 ? 48 : 40}" x2="${40 + k * 92}" y2="${k % 5 ? 72 : 80}" stroke="#fff" stroke-width="4"/>`).join('')}
      ${[0, 500, 1000].map((v, k) => `<text x="${40 + k * 460}" y="112" text-anchor="middle" fill="#FFD86B" font-size="30" font-family="Jua">${v.toLocaleString('en')}</text>`).join('')}
      <circle class="pt-marker" cx="-50" cy="60" r="16" fill="#FF9AC4"/></svg></div>
      <div class="center"><button class="big-btn pt-lineok" disabled>That's my answer</button></div>`;
  }
  if (q.type === 'facts') return factsSprint(q, top, record);

  const el = mount(html(`<section class="screen pt">${top}
    <div class="pt-body ${q.type === 'num' || q.type === 'multi' ? 'with-keys' : ''}">
      <div class="pt-qside"><h2 class="pt-q">${esc(q.q)}</h2>${note}${pic}${q.timed ? `<div class="pt-timer"><i></i></div>` : ''}</div>
      <div class="pt-aside">${answerArea}<div class="pt-foot">${idk}</div></div>
    </div></section>`));
  on(el, '.pt-home', () => { stop(); theoHome(true); });

  let done = false;
  const finish = async (a) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    a.ms = Date.now() - t0;
    if (q.check && !a.dontKnow) a = await selfCheck(el, q, a);
    if (q.how && !a.dontKnow) a.how = await askHow(el);
    sfx('pop');
    record(q, a);
  };
  on(el, '.pt-idk', () => finish({ dontKnow: true }));

  // timed: shrinking bar, then time's up
  let timer = null;
  if (q.timed) {
    const bar = $(el, '.pt-timer i');
    requestAnimationFrame(() => { bar.style.transition = `width ${q.timed}s linear`; bar.style.width = '0%'; });
    timer = setTimeout(() => finish({ timeout: true }), q.timed * 1000);
  }

  if (q.type === 'choice') {
    on(el, '.pt-opt, .pt-pc', (b) => { b.classList.add('sel'); finish({ value: +b.dataset.i }); });
  }
  if (q.type === 'num' || q.type === 'multi') {
    const fields = $$(el, '.pt-field');
    let cur = 0;
    const vals = fields.map(() => '');
    const paint = () => fields.forEach((f, k) => { f.textContent = vals[k]; f.classList.toggle('cur', k === cur); });
    on(el, '.pt-field', (f) => { cur = +f.dataset.f; paint(); });
    on(el, '.pt-keys button', (b) => {
      const k = b.dataset.k;
      sfx('pop');
      if (k === 'del') vals[cur] = vals[cur].slice(0, -1);
      else if (k === 'ok') {
        if (vals[cur] === '') return;
        if (cur < fields.length - 1) { cur++; paint(); return; }
        if (vals.some((v) => v === '')) { cur = vals.findIndex((v) => v === ''); paint(); return; }
        return finish({ value: q.type === 'num' ? +vals[0] : vals.map(Number) });
      } else if (vals[cur].length < 7) vals[cur] += k;
      paint();
    });
  }
  if (q.type === 'line') {
    const svgEl = $(el, '.pt-line svg'), marker = $(el, '.pt-marker'), ok = $(el, '.pt-lineok');
    let v = null;
    svgEl.addEventListener('pointerdown', (e) => {
      const r = svgEl.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 1000;
      const cx = Math.max(40, Math.min(960, x));
      marker.setAttribute('cx', cx);
      v = Math.round(((cx - 40) / 920) * q.max);
      ok.disabled = false;
      sfx('pop');
    });
    on(el, '.pt-lineok', () => { if (v !== null) finish({ value: v }); });
  }
}

// "Do you think your answer is right?" One chance to look again.
function selfCheck(el, q, a) {
  return new Promise((resolve) => {
    const ov = html(`<div class="pt-overlay"><div class="pt-modal">
      <h2 class="pt-h2">Your answer: <b>${(+a.value).toLocaleString('en')}</b></h2>
      <p class="pt-lead">Do you think your answer is right?</p>
      <div class="row center" style="gap:20px"><button class="big-btn sure">I'm sure</button><button class="big-btn alt again">Let me check again</button></div>
    </div></div>`);
    el.appendChild(ov);
    theoLine('check');
    on(ov, '.sure', () => { ov.remove(); resolve({ ...a, sure: true }); });
    on(ov, '.again', () => {
      ov.innerHTML = `<div class="pt-modal"><h2 class="pt-h2">${esc(q.q)}</h2><p class="pt-lead">Type your new answer (or the same one).</p>
        <div class="pt-entry"><div class="pt-field cur"></div></div>${keypad()}</div>`;
      let v = '';
      const f = $(ov, '.pt-field');
      on(ov, '.pt-keys button', (b) => {
        const k = b.dataset.k;
        if (k === 'del') v = v.slice(0, -1);
        else if (k === 'ok') { if (v === '') return; ov.remove(); return resolve({ ...a, first: a.value, value: +v, rechecked: true }); }
        else if (v.length < 7) v += k;
        f.textContent = v;
      });
    });
  });
}

function askHow(el) {
  return new Promise((resolve) => {
    const opts = [['head', 'In my head 🧠'], ['paper', 'On paper ✏️'], ['picture', 'I drew a picture 🎨'], ['guess', 'I guessed 🎲']];
    const ov = html(`<div class="pt-overlay"><div class="pt-modal"><h2 class="pt-h2">How did you solve it?</h2>
      <div class="pt-choices two">${opts.map(([k, t]) => `<button class="pt-opt" data-k="${k}">${t}</button>`).join('')}</div></div></div>`);
    el.appendChild(ov);
    on(ov, '.pt-opt', (b) => { ov.remove(); resolve(b.dataset.k); });
  });
}

function factsSprint(q, top, record) {
  const res = [];
  let k = 0, v = '', t = Date.now();
  const t0 = Date.now();
  const el = mount(html(`<section class="screen pt">${top}
    <div class="pt-body with-keys"><div class="pt-qside"><h2 class="pt-q">${esc(q.q)}</h2>
      <div class="pt-fact"><span class="pt-fq"></span> = <div class="pt-field cur"></div></div>
      <div class="pt-dots">${q.facts.map(() => '<i></i>').join('')}</div></div>
      <div class="pt-aside">${keypad()}</div></div></section>`));
  on(el, '.pt-home', () => theoHome(true));
  const fq = $(el, '.pt-fq'), f = $(el, '.pt-field'), dots = $$(el, '.pt-dots i');
  const show = () => { fq.textContent = `${q.facts[k][0]} × ${q.facts[k][1]}`; f.textContent = ''; v = ''; t = Date.now(); };
  show();
  on(el, '.pt-keys button', (b) => {
    const key = b.dataset.k;
    if (key === 'del') v = v.slice(0, -1);
    else if (key === 'ok') {
      if (v === '') return;
      const [a, bb] = q.facts[k];
      res.push({ f: `${a}x${bb}`, v: +v, ok: +v === a * bb, ms: Date.now() - t });
      dots[k].classList.add('done');
      sfx('pop');
      k++;
      if (k >= q.facts.length) return record(q, { value: res, correct: res.filter((r) => r.ok).length, ms: Date.now() - t0 });
      return show();
    } else if (v.length < 3) v += key;
    f.textContent = v;
  });
}

// ---------- report for 어른용 ----------
export function placementReport(s) {
  const rows = {};
  const sense = { selfcheck: [] };
  for (const [pi, p] of PARTS.entries()) {
    for (const q of p.questions) {
      const a = s.parts[pi].answers[q.id];
      if (!a) continue;
      const r = (rows[q.topic] ||= { concept: [0, 0], skill: [0, 0], skipped: 0, items: [] });
      const ok = isRight(q, a);
      r[q.kind][1]++;
      if (ok) r[q.kind][0]++;
      if (a.skipped) r.skipped++;
      r.items.push({ id: q.id, q: q.q, kind: q.kind, ok, a });
      if (q.check && !a.dontKnow && !a.skipped) {
        const firstRight = +(a.first ?? a.value) === q.answer;
        sense.selfcheck.push({ id: q.id, q: q.q, result: firstRight ? (a.rechecked && !ok ? 'changed a right answer' : 'right') : ok ? 'wrong → caught & fixed' : a.rechecked ? 'wrong → checked, still wrong' : 'wrong → trusted it' });
      }
    }
  }
  return { rows, sense };
}
export const rating = ([r, n]) => (n === 0 ? '—' : r / n >= 0.8 ? '탄탄' : r / n >= 0.5 ? '연습 필요' : '아직');
