// 태오's chapters 3–7 (Break It Apart, Check Like a Pro, Divide and Conquer 1 & 2, Fractions)
// and the mental-math warm-up question. Same generator shape as theomath.js.
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (n) => Number(n).toLocaleString('en');
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
function choice(base, right, wrongs) {
  const options = shuffle([right, ...new Set(wrongs.filter((w) => w !== right))]);
  return { ...base, type: 'choice', options, answer: options.indexOf(right) };
}
// 2-digit numbers with no zero digit (so every part of the area model shows up)
const two = () => R(1, 9) * 10 + R(1, 9);
const twoN = () => R(2, 9) * 10 + R(1, 9);

// ---------- pictures ----------
export function area(a, b) {
  // a and b split into tens and ones; rectangle with 4 labelled parts (or 2 if b < 10)
  const a1 = Math.floor(a / 10) * 10, a0 = a % 10, b1 = Math.floor(b / 10) * 10, b0 = b % 10;
  const cols = [a1, a0].filter(Boolean), rows = [b1, b0].filter(Boolean);
  const W = 520, H = rows.length > 1 ? 280 : 150;
  const cw = cols.length > 1 ? [370, 140] : [510], rh = rows.length > 1 ? [190, 80] : [140];
  const colors = ['#7B5CFA', '#FF9AC4', '#2BB5A8', '#FFB347'];
  let g = '', y = 30, k = 0;
  rows.forEach((r, i) => {
    let x = 46;
    cols.forEach((c, j) => {
      g += `<rect x="${x}" y="${y}" width="${cw[j] - 6}" height="${rh[i] - 6}" rx="6" fill="${colors[k++]}" opacity=".85"/><text x="${x + (cw[j] - 6) / 2}" y="${y + rh[i] / 2 + 6}" text-anchor="middle" font-size="${Math.min(26, rh[i] / 3)}" fill="#fff" font-family="Jua">${c} × ${r}</text>`;
      if (i === 0) g += `<text x="${x + (cw[j] - 6) / 2}" y="22" text-anchor="middle" font-size="24" fill="#FFD86B" font-family="Jua">${c}</text>`;
      x += cw[j];
    });
    g += `<text x="22" y="${y + rh[i] / 2 + 6}" text-anchor="middle" font-size="24" fill="#5ED3C7" font-family="Jua">${r}</text>`;
    y += rh[i];
  });
  return `<svg viewBox="0 0 ${W + 30} ${H + 40}" width="${W + 30}" class="pt-pic">${g}</svg>`;
}
export const worked = (rows) => `<div class="pt-worked">${rows.map((r) => `<div class="${r.cls || ''}">${r.t}</div>`).join('')}</div>`;
function fracBar(n, d, w = 360) {
  const s = w / d;
  return `<svg viewBox="0 0 ${w + 8} 70" width="${w + 8}" class="pt-pic">${Array.from({ length: d }, (_, i) => `<rect x="${4 + i * s}" y="4" width="${s}" height="60" fill="${i < n ? '#FFD86B' : 'rgba(255,255,255,.1)'}" stroke="#fff" stroke-width="3"/>`).join('')}</svg>`;
}
function fracPie(n, d, r = 70) {
  let b = `<circle cx="${r + 4}" cy="${r + 4}" r="${r}" fill="rgba(255,255,255,.1)" stroke="#fff" stroke-width="3"/>`;
  for (let i = 0; i < d; i++) {
    const a0 = (i * 2 * Math.PI) / d - Math.PI / 2, a1 = ((i + 1) * 2 * Math.PI) / d - Math.PI / 2, c = r + 4;
    b += `<path d="M${c} ${c} L${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}Z" fill="${i < n ? '#FF9AC4' : 'transparent'}" stroke="#fff" stroke-width="3"/>`;
  }
  return `<svg viewBox="0 0 ${2 * r + 8} ${2 * r + 8}" width="${2 * r + 8}" class="pt-pic">${b}</svg>`;
}
const dots = (n, color = '#D9A066') => `<svg viewBox="0 0 ${n * 40 + 10} 50" width="${Math.min(n * 40 + 10, 760)}" class="pt-pic">${Array.from({ length: n }, (_, i) => `<circle cx="${25 + i * 40}" cy="25" r="16" fill="${color}" stroke="#fff" stroke-width="2"/>`).join('')}</svg>`;
const F = (n, d) => `${n}/${d}`;

// ---------- skills ----------
export const SKILLS2 = {
  // ===== Break It Apart =====
  split: { name: 'Break apart: 2-digit × 1-digit', teach: 'split', gen() {
    const a = twoN(), b = R(3, 9), t = Math.floor(a / 10) * 10, o = a % 10;
    return { kind: 'concept', type: 'multi', q: `Break it apart: ${a} × ${b}`, pic: area(a, b), fields: [`${t} × ${b} =`, `${o} × ${b} =`, `${a} × ${b} =`], answer: [t * b, o * b, a * b], explain: `${a} = ${t} + ${o}. ${t} × ${b} = ${fmt(t * b)} and ${o} × ${b} = ${o * b}. Add them: ${fmt(a * b)}.`, tag: (v) => (v[0] * 10 === t * b ? 'lostZero' : v[2] === v[0] || v[2] === v[1] ? 'partMissing' : null) };
  } },
  x21: { name: '2-digit × 1-digit', teach: null, gen() {
    const a = twoN(), b = R(3, 9), t = Math.floor(a / 10) * 10, o = a % 10, ans = a * b;
    return { kind: 'skill', type: 'num', q: `${a} × ${b} = ?`, note: 'Break it apart in your head or on paper.', answer: ans, picAfter: area(a, b), explain: `${t} × ${b} = ${fmt(t * b)}, ${o} × ${b} = ${o * b}. ${fmt(t * b)} + ${o * b} = ${fmt(ans)}.`, tag: (v) => (v === t * b || v === o * b ? 'partMissing' : v !== ans && Math.abs(v - ans) % 10 === 0 && Math.abs(v - ans) <= 90 ? 'carry' : null) };
  } },
  area22: { name: 'Area model: 2-digit × 2-digit', teach: 'area', gen() {
    const a = R(1, 8) * 10 + R(1, 9), b = R(1, 4) * 10 + R(1, 9);
    const A = [Math.floor(a / 10) * 10, a % 10], B = [Math.floor(b / 10) * 10, b % 10];
    const parts = [A[0] * B[0], A[1] * B[0], A[0] * B[1], A[1] * B[1]];
    return { kind: 'concept', type: 'multi', q: `Fill in the area model for ${a} × ${b}.`, pic: area(a, b), fields: [`${A[0]} × ${B[0]} =`, `${A[1]} × ${B[0]} =`, `${A[0]} × ${B[1]} =`, `${A[1]} × ${B[1]} =`, `${a} × ${b} =`], answer: [...parts, a * b], explain: `Four parts: ${parts.map(fmt).join(' + ')} = ${fmt(a * b)}.`, tag: (v) => (v[1] === A[1] * b || v[2] === a * B[1] ? 'wholeNotPart' : v.slice(0, 4).some((x, i) => x * 10 === parts[i]) ? 'lostZero' : null) };
  } },
  miscon: { name: 'All four parts', teach: 'area', gen() {
    const a = R(2, 4) * 10 + 5, b = R(2, 9) * 10 + R(2, 8);
    const A = [Math.floor(a / 10) * 10, a % 10], B = [Math.floor(b / 10) * 10, b % 10];
    const right = `${A[0]} × ${B[0]} + ${A[0]} × ${B[1]} + ${A[1]} × ${B[0]} + ${A[1]} × ${B[1]}`;
    return choice({ kind: 'concept', q: `Which one is the same as ${a} × ${b}?`, note: 'Think of the area model.', picAfter: area(a, b), explain: `The rectangle has four parts. ${A[0]} × ${B[0]} + ${A[1]} × ${B[1]} leaves out the two middle parts, ${A[0]} × ${B[1]} and ${A[1]} × ${B[0]}.` },
      right, [`${A[0]} × ${B[0]} + ${A[1]} × ${B[1]}`, `${A[0]} × ${b} + ${A[1]}`, `${a} × ${B[0]} + ${B[1]}`]);
  } },
  col22: { name: '2-digit × 2-digit', teach: 'col', gen() {
    const a = twoN(), b = R(1, 4) * 10 + R(2, 9), ans = a * b, b1 = Math.floor(b / 10), b0 = b % 10;
    return { kind: 'skill', type: 'num', q: `${a} × ${b} = ?`, note: `Estimate first: about ${fmt(Math.round(a / 10) * 10 * Math.round(b / 10) * 10)}.`, answer: ans,
      picAfter: worked([{ t: String(a) }, { t: `× ${b}`, cls: 'op' }, { t: fmt(a * b0), cls: 'line' }, { t: fmt(a * b1 * 10) }, { t: fmt(ans), cls: 'line' }]),
      explain: `${a} × ${b0} = ${fmt(a * b0)}. ${a} × ${b1 * 10} = ${fmt(a * b1 * 10)} (it ends in 0 because it's tens). ${fmt(a * b0)} + ${fmt(a * b1 * 10)} = ${fmt(ans)}.`,
      tag: (v) => (v === a * b0 + a * b1 ? 'rowZero' : Math.abs(v - ans) % 10 === 0 && Math.abs(v - ans) <= 100 ? 'carry' : null) };
  } },
  col32: { name: '3-digit × 2-digit', teach: 'col', gen() {
    const a = R(1, 9) * 100 + two(), b = R(1, 4) * 10 + R(2, 9), ans = a * b, b1 = Math.floor(b / 10), b0 = b % 10;
    return { kind: 'skill', type: 'num', q: `${a} × ${b} = ?`, note: `Estimate first: about ${fmt(Math.round(a / 100) * 100 * Math.round(b / 10) * 10)}. Use paper!`, answer: ans,
      picAfter: worked([{ t: String(a) }, { t: `× ${b}`, cls: 'op' }, { t: fmt(a * b0), cls: 'line' }, { t: fmt(a * b1 * 10) }, { t: fmt(ans), cls: 'line' }]),
      explain: `${a} × ${b0} = ${fmt(a * b0)}. ${a} × ${b1 * 10} = ${fmt(a * b1 * 10)}. Add the two rows: ${fmt(ans)}.`,
      tag: (v) => (v === a * b0 + a * b1 ? 'rowZero' : Math.abs(v - ans) <= 1000 && Math.abs(v - ans) % 10 === 0 ? 'carry' : null) };
  } },
  // ===== Check Like a Pro =====
  lastd: { name: 'Last-digit check', teach: 'lastd', gen() {
    const a = R(1, 9) * 100 + two(), b = R(12, 89), d = (a % 10) * (b % 10) % 10;
    return choice({ kind: 'concept', q: `Without solving: what must the last digit of ${a} × ${b} be?`, explain: `Only the ones digits make the last digit: ${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}, so it ends in ${d}. (${fmt(a * b)})` },
      String(d), [String((d + 2) % 10), String((d + 5) % 10), String(((a % 10) + (b % 10)) % 10)]);
  } },
  judge: { name: 'Could it be right?', teach: 'lastd', gen() {
    const a = twoN(), b = twoN(), p = a * b;
    const kind = pickOne(['ok', 'digit', 'size']);
    let claim = p;
    if (kind === 'digit') claim = p + pickOne([-3, -1, 1, 2, 4]);
    if (kind === 'size') claim = Math.random() < 0.5 ? Math.floor(p / 100) * 10 + (p % 10) : p * 10 + (p % 10); // same last digit, wrong size
    const right = kind === 'ok' ? 'Could be right: size and last digit both check out' : kind === 'digit' ? 'Wrong: the last digit doesn’t match' : 'Wrong: it’s the wrong size';
    return choice({ kind: 'concept', q: `Jun says ${a} × ${b} = ${fmt(claim)}. What do your checks say?`, explain: `Size: about ${fmt(Math.round(a / 10) * 10 * Math.round(b / 10) * 10)}. Last digit: ${a % 10} × ${b % 10} ends in ${(a % 10) * (b % 10) % 10}. The answer is ${fmt(p)}.` },
      right, ['Could be right: size and last digit both check out', 'Wrong: the last digit doesn’t match', 'Wrong: it’s the wrong size']);
  } },
  estsolve: { name: 'Estimate, then solve', teach: null, gen() {
    const a = twoN(), b = R(12, 49), A = Math.round(a / 10) * 10, B = Math.round(b / 10) * 10;
    return { kind: 'skill', type: 'multi', q: `${a} × ${b}: estimate first, then solve.`, fields: [`${A} × ${B} =`, `${a} × ${b} =`], answer: [A * B, a * b], explain: `Estimate: ${A} × ${B} = ${fmt(A * B)}. Exact: ${fmt(a * b)}, which is close to the estimate, so it makes sense.`, tag: (v) => (v[0] * 10 === A * B ? 'lostZero' : v[1] === a * (b % 10) + a * Math.floor(b / 10) ? 'rowZero' : null) };
  } },
  keep: { name: 'Keep or change?', teach: null, gen() {
    const a = R(12, 39), b = R(110, 160), p = a * b, ld = (a % 10) * (b % 10) % 10;
    const wrongFirst = Math.random() < 0.5;
    const first = wrongFirst ? p + pickOne([-3, -1, 1, 2]) * (Math.random() < 0.5 ? 1 : 11) : p;
    const right = wrongFirst ? 'Change it: the last digit doesn\u2019t match' : 'Keep it: the check says it could be right';
    return choice({ kind: 'concept', q: `You got ${a} × ${b} = ${fmt(first)}, but you're not sure. Last-digit check: ${a % 10} × ${b % 10} ends in ${ld}. What should you do?`,
      explain: `${fmt(first)} ends in ${first % 10}${first % 10 === ld ? ', which matches, so keep it' : `, but it must end in ${ld}, so look again`}. ${a} × ${b} = ${fmt(p)}. Only change an answer when a check finds a reason.` },
      right, ['Keep it: the check says it could be right', 'Change it: the last digit doesn\u2019t match', 'Change it anyway, just in case']);
  } },
  // ===== Divide and Conquer 1 =====
  dfact: { name: 'Division facts', teach: null, gen() {
    const a = R(3, 9), b = R(3, 9);
    return { kind: 'skill', type: 'num', q: `${a * b} ÷ ${b} = ?`, answer: a, explain: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}.` };
  } },
  rem: { name: 'Remainders', teach: 'rem', gen() {
    const d = R(3, 9), q = R(2, 9), r = R(1, d - 1), n = d * q + r;
    return { kind: 'skill', type: 'multi', q: `${n} ÷ ${d} = ?`, pic: dots(Math.min(n, 18)), fields: ['answer', 'remainder'], answer: [q, r], explain: `${q} groups of ${d} = ${d * q}, and ${r} left over. So ${n} ÷ ${d} = ${q} remainder ${r}.`, tag: (v) => (v[0] === d * q ? 'qIsMultiple' : null) };
  } },
  remstory: { name: 'Remainders in stories', teach: 'remstory', gen() {
    const d = R(3, 6), q = R(4, 9), r = R(1, d - 1), n = d * q + r;
    if (Math.random() < 0.5) return { kind: 'concept', type: 'num', q: `${n} kids are going on a trip. Each car holds ${d} kids. How many cars do they need?`, unit: 'cars', answer: q + 1, explain: `${n} ÷ ${d} = ${q} remainder ${r}. ${q} cars are full, but ${r} kid${r > 1 ? 's' : ''} still need${r > 1 ? '' : 's'} a ride, so ${q + 1} cars.`, tag: (v) => (v === q ? 'noRoundUp' : null) };
    return { kind: 'concept', type: 'num', q: `You have ${n} cookies. You fill boxes with ${d} cookies each. How many boxes can you fill?`, unit: 'boxes', answer: q, explain: `${n} ÷ ${d} = ${q} remainder ${r}. Only ${q} boxes are full; the ${r} left over can't fill another box.`, tag: (v) => (v === q + 1 ? 'roundedUp' : null) };
  } },
  dtens: { name: 'Dividing tens', teach: 'dtens', gen() {
    const d = R(2, 9), q = R(2, 9);
    return { kind: 'skill', type: 'num', q: `${d * q * 10} ÷ ${d} = ?`, answer: q * 10, explain: `${d * q * 10} is ${d * q} tens. ${d * q} tens ÷ ${d} = ${q} tens = ${q * 10}.`, tag: (v) => (v === q ? 'lostZero' : null) };
  } },
  dsplit: { name: 'Break apart: 2-digit ÷ 1-digit', teach: 'dtens', gen() {
    const d = R(2, 4), t = R(1, Math.floor(8 / d)) * 10 * d, o = d * R(1, 3), n = t + o;
    return { kind: 'concept', type: 'multi', q: `Break it apart: ${n} ÷ ${d}`, fields: [`${t} ÷ ${d} =`, `${o} ÷ ${d} =`, `${n} ÷ ${d} =`], answer: [t / d, o / d, n / d], explain: `${n} = ${t} + ${o}. ${t} ÷ ${d} = ${t / d}, ${o} ÷ ${d} = ${o / d}. Together: ${n / d}.` };
  } },
  d21: { name: '2-digit ÷ 1-digit', teach: null, gen() {
    const d = R(2, 6), q = R(12, Math.floor(99 / d)), n = d * q;
    return { kind: 'skill', type: 'num', q: `${n} ÷ ${d} = ?`, answer: q, explain: `Split ${n} into easy parts: ${Math.floor(q / 10) * 10 * d} + ${(q % 10) * d}. ${Math.floor(q / 10) * 10 * d} ÷ ${d} = ${Math.floor(q / 10) * 10}, ${(q % 10) * d} ÷ ${d} = ${q % 10}. So ${q}. Check: ${q} × ${d} = ${n}.` };
  } },
  // ===== Divide and Conquer 2 =====
  pq: { name: 'Partial quotients', teach: 'pq', gen() {
    const big = Math.random() < 0.5;
    const d = big ? R(11, 15) : R(3, 9), q = big ? R(11, 19) : R(21, 49), n = d * q, tens = Math.floor(q / 10) * 10;
    return { kind: 'concept', type: 'multi', q: `Divide in chunks: ${n} ÷ ${d}`, fields: [`${tens} × ${d} =`, `${n} − ${fmt(tens * d)} =`, `${n - tens * d} ÷ ${d} =`, `${n} ÷ ${d} =`], answer: [tens * d, n - tens * d, q - tens, q], explain: `Take ${tens} groups of ${d} (${fmt(tens * d)}). ${n - tens * d} is left, which is ${q - tens} more groups. ${tens} + ${q - tens} = ${q}.` };
  } },
  d31: { name: '3-digit ÷ 1-digit', teach: null, gen() {
    const d = R(3, 9), q = R(Math.max(21, Math.ceil(100 / d)), Math.floor(999 / d)), n = d * q;
    return { kind: 'skill', type: 'num', q: `${n} ÷ ${d} = ?`, note: 'Use chunks of 10 or 100 groups.', answer: q, explain: `${n} ÷ ${d} = ${q}. Check: ${q} × ${d} = ${n}.` };
  } },
  d32: { name: '3-digit ÷ 2-digit', teach: 'pq', gen() {
    const d = R(11, 19), q = R(11, 29), n = d * q;
    return { kind: 'skill', type: 'num', q: `${n} ÷ ${d} = ?`, note: `Start with 10 groups of ${d} = ${d * 10}.`, answer: q, explain: `10 × ${d} = ${d * 10}. ${n} − ${d * 10} = ${n - d * 10}, which is ${q - 10} more ${d}s. So ${q}. Check: ${q} × ${d} = ${n}.` };
  } },
  dcheck: { name: 'Check division with ×', teach: null, gen() {
    const d = R(3, 9), q = R(12, 60), n = d * q, ok = Math.random() < 0.5, claim = ok ? q : q + pickOne([-2, -1, 1, 2]);
    return choice({ kind: 'concept', q: `Mina says ${n} ÷ ${d} = ${claim}. Check it by multiplying: ${claim} × ${d} = ?`, explain: `${claim} × ${d} = ${claim * d}. ${ok ? `That's ${n}, so she's right.` : `That's not ${n}, so she's wrong: ${n} ÷ ${d} = ${q}.`}` },
      ok ? `${claim * d}, so she's right` : `${claim * d}, so she's wrong`, ok ? [`${claim * d + d}, so she's wrong`, `${claim * d - d}, so she's wrong`] : [`${n}, so she's right`, `${claim * d + 10}, so she's right`]);
  } },
  // ===== Fractions 1 =====
  fname: { name: 'Name the fraction', teach: 'fname', gen() {
    const d = pickOne([2, 3, 4, 5, 6, 8]), n = R(1, d - 1), pie = Math.random() < 0.5;
    return choice({ kind: 'concept', q: 'What fraction is colored?', pic: pie ? fracPie(n, d) : fracBar(n, d), explain: `There are ${d} equal parts and ${n} ${n > 1 ? 'are' : 'is'} colored: ${F(n, d)}. The bottom number counts the parts; the top counts the colored ones.` },
      F(n, d), [F(d, n), F(d - n, d), F(n, d + 1)]);
  } },
  funit: { name: 'Compare unit fractions', teach: 'funit', gen() {
    const [a, b] = shuffle([2, 3, 4, 5, 6, 8, 10]).slice(0, 2), big = Math.min(a, b);
    return choice({ kind: 'concept', q: `Which is bigger: ${F(1, a)} or ${F(1, b)} of the same pizza?`, picAfter: `<div class="row" style="gap:30px">${fracPie(1, a, 60)}${fracPie(1, b, 60)}</div>`, explain: `Fewer slices means bigger slices. ${F(1, big)} is cut into ${big} pieces, so each piece is bigger.` },
      `${F(1, big)} is bigger`, [`${F(1, Math.max(a, b))} is bigger`, 'They are the same']);
  } },
  fsame: { name: 'Compare: same bottom number', teach: null, gen() {
    const d = pickOne([5, 6, 8, 10]), [x, y] = shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, 2);
    return choice({ kind: 'concept', q: `Which is bigger: ${F(x, d)} or ${F(y, d)}?`, picAfter: `<div style="display:flex;flex-direction:column;gap:8px">${fracBar(x, d)}${fracBar(y, d)}</div>`, explain: `Same-size parts (${d}ths), so more parts is bigger: ${F(Math.max(x, y), d)}.` },
      F(Math.max(x, y), d), [F(Math.min(x, y), d), 'They are the same']);
  } },
  fof: { name: 'Fraction of a group', teach: 'fof', gen() {
    const d = pickOne([2, 3, 4, 5]), k = R(2, 5), n = Math.random() < 0.5 ? 1 : R(1, d - 1), total = d * k;
    return { kind: 'skill', type: 'num', q: `What is ${F(n, d)} of ${total}?`, pic: dots(Math.min(total, 18)), answer: n * k, explain: `Split ${total} into ${d} equal groups of ${k}. ${n} group${n > 1 ? 's' : ''} = ${n * k}.`, tag: (v) => (v === k && n > 1 ? 'onlyUnit' : null) };
  } },
  fline: { name: 'Fractions on a number line', teach: null, gen() {
    const d = pickOne([2, 3, 4, 5]), n = R(1, d - 1), v = Math.round((n / d) * 100);
    return { kind: 'concept', type: 'line', q: `Tap where ${F(n, d)} goes on the number line.`, max: 100, labels: ['0', '', '1'], ticks: 0, ansText: `${n} of ${d} equal jumps (the green dot)`, picAfter: fracBar(n, d), answer: v, ok: [v - 7, v + 7], explain: `Split 0 to 1 into ${d} equal jumps. ${F(n, d)} is ${n} jump${n > 1 ? 's' : ''} from 0.` };
  } },
  fequiv: { name: 'Equal fractions', teach: 'fequiv', gen() {
    const [n, d] = pickOne([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]), k = pickOne([2, 3]);
    return choice({ kind: 'concept', q: `Which is the same as ${F(n, d)}?`, picAfter: `<div style="display:flex;flex-direction:column;gap:8px">${fracBar(n, d)}${fracBar(n * k, d * k)}</div>`, explain: `Cut each part of ${F(n, d)} into ${k}: you get ${F(n * k, d * k)}. Same amount, more pieces.` },
      F(n * k, d * k), [F(n + k, d + k), F(n * k, d), F(n, d * k)]);
  } },
  // ===== mental math (one per session, every chapter) =====
  mental: { name: 'Mental math', teach: null, gen() {
    const f = pickOne(['up', 'comp', 'dh', 'x25']);
    if (f === 'up') { const b = R(3, 9) * 10 + R(5, 9), a = Math.ceil(b / 10) * 10 + R(1, 5); return { kind: 'skill', type: 'num', q: `${a} − ${b} = ?`, note: 'Count up! No column method.', answer: a - b, explain: `Count up from ${b}: to ${Math.ceil(b / 10) * 10} is ${Math.ceil(b / 10) * 10 - b}, then to ${a} is ${a - Math.ceil(b / 10) * 10} more. ${a - b} altogether.` }; }
    if (f === 'comp') { const a = R(3, 9) * 100 + R(1, 9), k = R(1, 3), h = R(1, Math.floor(a / 100) - 1) * 100, b = h - k; return { kind: 'skill', type: 'num', q: `${a} − ${b} = ?`, note: `Hint: ${b} is close to ${h}.`, answer: a - b, explain: `${b} is ${k} less than ${h}. ${a} − ${h} = ${a - h}, then add ${k} back: ${a - b}. (Or: ${a + k} − ${h}.)` }; }
    if (f === 'dh') { const a = pickOne([5, 25]), b = (a === 5 ? R(6, 19) : R(3, 9)) * 2; return { kind: 'skill', type: 'num', q: `${a} × ${b} = ?`, note: 'Double one, halve the other.', answer: a * b, explain: `${a} × ${b} = ${a * 2} × ${b / 2} = ${a * b}.` }; }
    const n = R(2, 9) * 4; return { kind: 'skill', type: 'num', q: `${n} × 25 = ?`, note: '× 25 is the same as × 100, then ÷ 4.', answer: n * 25, explain: `${n} × 100 = ${fmt(n * 100)}, ÷ 4 = ${fmt(n * 25)}.` };
  } }
};

export const CHAPTERS2 = [
  { id: 'bia', name: 'Break It Apart', sub: 'The area model and the column method', color: '#9EC5FF', icon: '🧩', skills: ['split', 'x21', 'area22', 'miscon', 'col22', 'col32'] },
  { id: 'check', name: 'Check Like a Pro', sub: 'Catch your own slips', color: '#FFD86B', icon: '🔍', skills: ['lastd', 'judge', 'estsolve', 'keep'] },
  { id: 'div1', name: 'Divide and Conquer', sub: 'Remainders and dividing tens', color: '#B48CFF', icon: '➗', skills: ['dfact', 'rem', 'remstory', 'dtens', 'dsplit', 'd21'] },
  { id: 'div2', name: 'Divide and Conquer 2', sub: 'Dividing bigger numbers', color: '#FF8A3D', icon: '🧱', skills: ['pq', 'd31', 'd32', 'dcheck'] },
  { id: 'frac', name: 'Fractions', sub: 'Parts of a whole', color: '#5ED3C7', icon: '🍕', skills: ['fname', 'funit', 'fsame', 'fof', 'fline', 'fequiv'] }
];

export const TEACH2 = {
  split: [{ text: 'Big numbers are easier in parts. 47 = 40 + 7, so 47 × 6 = 40 × 6 + 7 × 6.', pic: () => area(47, 6) },
    { text: '40 × 6 = 240 and 7 × 6 = 42. Add them: 240 + 42 = 282.', pic: () => '<div class="big-eq">40 × 6 = 240<br>7 × 6 = 42<br>47 × 6 = 282</div>' }],
  area: [{ text: '23 × 14 is a rectangle. Split 23 into 20 + 3 and 14 into 10 + 4. Now there are FOUR parts.', pic: () => area(23, 14) },
    { text: 'Every part counts: 20 × 10 = 200, 3 × 10 = 30, 20 × 4 = 80, 3 × 4 = 12. Total 322.', pic: () => '<div class="big-eq">200 + 30 + 80 + 12 = 322</div>' },
    { text: 'A common trap: 20 × 10 + 3 × 4 only counts two corners. The two middle parts are missing!', pic: () => '<div class="big-eq">❌ 200 + 12 = 212<br>✅ 200 + 30 + 80 + 12 = 322</div>' }],
  col: [{ text: 'The column method is the area model in a shorter way. Row 1 is × the ones digit.', pic: () => worked([{ t: '347' }, { t: '× 26', cls: 'op' }, { t: '2,082', cls: 'line' }, { t: '6,940' }, { t: '9,022', cls: 'line' }]) },
    { text: 'Row 2 is × the TENS digit: 347 × 20 = 6,940. That’s why row 2 ends in 0. Then add the rows.', pic: () => '<div class="big-eq">347 × 6 = 2,082<br>347 × 20 = 6,940<br>2,082 + 6,940 = 9,022</div>' }],
  lastd: [{ text: 'Check 1, the last digit: only the ones digits make it. 347 × 26 → 7 × 6 = 42, so the answer must end in 2.', pic: () => '<div class="big-eq">34<b style="color:#FF9AC4">7</b> × 2<b style="color:#FF9AC4">6</b><br>7 × 6 = 4<b style="color:#FF9AC4">2</b> → ends in 2</div>' },
    { text: 'Check 2, the size: 347 × 26 is about 350 × 25 = 8,750. If both checks pass, keep your answer!', pic: () => '<div class="big-eq">9,022 ✅ size ✅ last digit</div>' }],
  rem: [{ text: '17 ÷ 5: make groups of 5. You get 3 groups and 2 left over. The 2 is the remainder.', pic: () => '<div class="big-eq">17 ÷ 5 = 3 r 2</div>' },
    { text: 'The answer is the number of groups (3), not 15. 15 is how many you used: 3 × 5 = 15, and 17 − 15 = 2.', pic: () => '<div class="big-eq">3 × 5 + 2 = 17</div>' }],
  remstory: [{ text: 'In stories, think about the leftovers. 26 kids, 4 per car: 6 cars are full, 2 kids left. They still need a car: 7 cars!', pic: () => '<div class="big-eq">26 ÷ 4 = 6 r 2 → 7 cars</div>' },
    { text: 'But 26 cookies, 4 per box: only 6 boxes are full. The 2 extra cookies don’t make a box.', pic: () => '<div class="big-eq">26 ÷ 4 = 6 r 2 → 6 boxes</div>' }],
  dtens: [{ text: '80 ÷ 4: 80 is 8 tens. 8 tens ÷ 4 = 2 tens = 20.', pic: () => '<div class="big-eq">8 ÷ 4 = 2<br>80 ÷ 4 = 20</div>' },
    { text: 'Bigger numbers break apart too: 84 ÷ 4 = 80 ÷ 4 + 4 ÷ 4 = 20 + 1 = 21.', pic: () => '<div class="big-eq">84 ÷ 4 = 20 + 1 = 21</div>' }],
  pq: [{ text: 'Division is repeated subtraction, in big chunks. 156 ÷ 12: take away 10 twelves (120). 36 is left.', pic: () => '<div class="big-eq">156 − 120 = 36</div>' },
    { text: '36 is 3 more twelves. 10 + 3 = 13 twelves, so 156 ÷ 12 = 13. Check: 13 × 12 = 156.', pic: () => '<div class="big-eq">10 + 3 = 13<br>13 × 12 = 156 ✅</div>' }],
  fname: [{ text: 'A fraction names equal parts. The bottom number says how many equal parts; the top says how many we count.', pic: () => fracBar(3, 4) },
    { text: '4 equal parts, 3 colored: three fourths, written 3/4.', pic: () => '<div class="big-eq">3/4</div>' }],
  funit: [{ text: '1/2 or 1/4 of the same pizza? Cutting into more pieces makes each piece smaller, so 1/2 is bigger.', pic: () => `<div class="row" style="gap:40px">${fracPie(1, 2)}${fracPie(1, 4)}</div>` }],
  fof: [{ text: '1/4 of 12: split 12 into 4 equal groups. Each group has 3, so 1/4 of 12 = 3. And 3/4 of 12 = 3 groups = 9.', pic: () => dots(12) }],
  fequiv: [{ text: '1/2 and 2/4 are the same amount: cut each half in two and you get 2 of 4 pieces.', pic: () => `<div style="display:flex;flex-direction:column;gap:8px">${fracBar(1, 2)}${fracBar(2, 4)}</div>` }]
};
