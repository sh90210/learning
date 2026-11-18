// 태오's training: chapter home, teach cards, practice with feedback, warm-up sprint, rewards.
import { app, html, mount, on, $, $$, esc, burst, toast } from './ui.js';
import { sfx, stop, theoLine } from './audio.js';
import { loadTheo, addCoins, coinChip, locker } from './locker.js';
import { ballon, celebrate, SHOP_BY_ID } from './ballon.js';
import { CHAPTERS, SKILLS, TEACH, loadMath, saveMath, sk, chapterProgress, buildSession, makeQuestion, isRightQ, record, recordFact, fmt } from './theomath.js';

const KEYS = [7, 8, 9, 4, 5, 6, 1, 2, 3];
const keypad = () => `<div class="pt-keys">${KEYS.map((n) => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="del" class="del">⌫</button><button data-k="0">0</button><button data-k="ok" class="ok">OK</button></div>`;
const PRAISE = ['Nice one!', 'Brilliant!', 'Spot on!', 'Great thinking!', 'You got it!', 'Top bins!', 'What a strike!'];
const COIN_RIGHT = 5, COIN_SESSION = 20;
const TAG_TIP = {
  lostZero: 'Looks like a zero went missing. Count the tens and hundreds!',
  lostZeros: 'Two zeros went missing. Tens × tens makes hundreds!',
  extraZero: 'One zero too many. Check what each number really is.',
  tensVsNumber: 'Close! The question asks how many tens, not the whole number.',
  wrongWay: '÷ 10 makes a number smaller, not bigger.'
};

// ---------- home ----------
export async function trainHome(back) {
  stop();
  const tp = await loadTheo();
  const m = await loadMath();
  const cards = CHAPTERS.map((c, i) => {
    const pr = c.soon ? 0 : chapterProgress(m, c);
    return `<button class="tr-ch ${c.soon ? 'soon' : ''}" data-ch="${c.id}" style="--c:${c.color}">
      <span class="tr-icon">${c.icon}</span><span class="tr-n">Chapter ${i + 1}</span>
      <span class="tr-name">${esc(c.name)}</span><span class="tr-sub">${esc(c.sub)}</span>
      ${c.soon ? '' : `<span class="tr-bar"><i style="width:${Math.round(pr * 100)}%"></i></span><span class="tr-pct">${pr >= 0.8 ? '⭐ Mastered!' : `${Math.round(pr * 100)}%`}</span>`}
    </button>`;
  }).join('');
  const el = mount(html(`<section class="screen pt">
    <div class="row"><button class="round back" aria-label="Back">←</button><h1 class="title" style="font-size:56px;margin:0 auto">Theo's Training</h1>${coinChip(tp.coins)}</div>
    <div class="pt-homewrap">
      <div class="pt-ballon"><div class="pt-bwrap">${ballon({ equipped: tp.equipped, size: 220 })}</div>
        <button class="big-btn pt-locker">Ballon's Locker</button>
        <button class="tr-check">📋 Math Check</button></div>
      <div class="tr-chapters">${cards}</div>
    </div></section>`));
  theoLine('welcome_back');
  on(el, '.back', () => { stop(); (back || (() => app.go('entry')))(); });
  on(el, '.pt-locker', () => { sfx('pop'); locker(() => trainHome(back)); });
  on(el, '.pt-bwrap', () => celebrate($(el, '.pt-bwrap .ballon'), SHOP_BY_ID[tp.equipped.celebrate].cel));
  on(el, '.tr-check', () => { sfx('pop'); toast('Math Check is done! A grown-up can see the results.'); });
  on(el, '.tr-ch', async (b) => {
    if (b.classList.contains('soon')) { sfx('bad'); toast('Coming soon!'); return; }
    sfx('ok');
    const mm = await loadMath();
    runSession(buildSession(mm, b.dataset.ch), mm, back);
  });
}

// ---------- session ----------
function header(S) {
  const n = S.steps.length;
  return `<div class="pt-top"><button class="round pt-home" aria-label="Stop">✕</button>
    <div class="pt-bar"><i style="width:${(S.i / n) * 100}%"></i></div>${coinChip(S.coins)}</div>`;
}
function runSession(S, m, back) {
  const next = async () => {
    await saveMath(m);
    if (S.i >= S.steps.length) return finish(S, m, back);
    const st = S.steps[S.i];
    if (st.type === 'warmup') return warmup(S, m, st, done);
    if (st.type === 'teach') return teach(S, m, st, done);
    return question(S, m, st, done);
  };
  const done = () => { S.i++; next(); };
  S.quit = () => { stop(); trainHome(back); };
  window.__theoS = S; // for tests
  next();
}

function warmup(S, m, st, done) {
  let k = 0, v = '', t = Date.now();
  const el = mount(html(`<section class="screen pt">${header(S)}
    <div class="pt-body with-keys"><div class="pt-qside"><h2 class="pt-q">Warm-up sprint! ⚡</h2><p class="pt-note">5 quick facts. As fast as you can!</p>
      <div class="pt-fact"><span class="pt-fq"></span> = <div class="pt-field cur"></div></div>
      <div class="pt-dots">${st.facts.map(() => '<i></i>').join('')}</div></div>
      <div class="pt-aside">${keypad()}</div></div></section>`));
  theoLine('sprint');
  on(el, '.pt-home', S.quit);
  const fq = $(el, '.pt-fq'), f = $(el, '.pt-field'), dots = $$(el, '.pt-dots i');
  const show = () => { fq.textContent = `${st.facts[k][0]} × ${st.facts[k][1]}`; f.textContent = ''; v = ''; t = Date.now(); };
  show();
  on(el, '.pt-keys button', (b) => {
    const key = b.dataset.k;
    if (key === 'del') v = v.slice(0, -1);
    else if (key === 'ok') {
      if (v === '') return;
      const [a, c] = st.facts[k], ok = +v === a * c;
      recordFact(m, a, c, ok, Date.now() - t);
      dots[k].classList.add(ok ? 'done' : 'miss');
      if (!ok) { fq.textContent = `${a} × ${c} = ${a * c}`; f.textContent = ''; sfx('bad'); }
      else sfx('pop');
      k++;
      setTimeout(() => (k >= st.facts.length ? done() : show()), ok ? 150 : 1400);
      return;
    } else if (v.length < 3) v += key;
    f.textContent = v;
  });
}

function teach(S, m, st, done) {
  const pages = TEACH[st.teach];
  let p = 0;
  const render = () => {
    const pg = pages[p];
    const el = mount(html(`<section class="screen pt">${header(S)}
      <div class="tr-teach"><span class="tr-tag">Learn · ${esc(SKILLS[st.skill].name)}</span>
        <div class="tr-tpic">${pg.pic()}</div>
        <p class="tr-ttext">${esc(pg.text)}</p></div>
      <div class="row" style="justify-content:flex-end;gap:16px">${p > 0 ? '<button class="big-btn alt tr-back">Back</button>' : ''}<button class="big-btn tr-next">${p < pages.length - 1 ? 'Next' : 'Got it! Let’s try'}</button></div>
    </section>`));
    on(el, '.pt-home', S.quit);
    on(el, '.tr-back', () => { p--; render(); });
    on(el, '.tr-next', () => {
      sfx('pop');
      if (p < pages.length - 1) { p++; render(); return; }
      for (const id of Object.keys(SKILLS)) if (SKILLS[id].teach === st.teach) sk(m, id).taught = true;
      done();
    });
  };
  render();
}

function question(S, m, st, done) {
  const q = st.q || (st.q = makeQuestion(st.skill));
  const t0 = Date.now();
  const tag = q.kind === 'concept' ? 'Think' : q.kind === 'sense' ? 'Ballpark' : 'Solve';
  let area = '';
  if (q.type === 'choice') area = `<div class="pt-choices ${q.options.some((o) => o.length > 22) ? 'one' : ''}">${q.options.map((o, k) => `<button class="pt-opt" data-i="${k}"><b>${'ABCD'[k]}</b>${esc(o)}</button>`).join('')}</div>`;
  else if (q.type === 'num') area = `<div class="pt-entry"><div class="pt-field cur" data-f="0"></div>${q.unit ? `<span class="pt-unit">${esc(q.unit)}</span>` : ''}</div>${keypad()}`;
  else if (q.type === 'multi') area = `<div class="pt-multi">${q.fields.map((f, k) => `<label><span>${esc(f)}</span><div class="pt-field ${k === 0 ? 'cur' : ''}" data-f="${k}"></div></label>`).join('')}</div>${keypad()}`;
  else if (q.type === 'line') area = `<div class="pt-line"><svg viewBox="0 0 1000 120" width="1000" height="120">
      <line x1="40" y1="60" x2="960" y2="60" stroke="#fff" stroke-width="5"/>
      ${Array.from({ length: 11 }, (_, k) => `<line x1="${40 + k * 92}" y1="${k % 5 ? 48 : 40}" x2="${40 + k * 92}" y2="${k % 5 ? 72 : 80}" stroke="#fff" stroke-width="4"/>`).join('')}
      ${[0, q.max / 2, q.max].map((v, k) => `<text x="${40 + k * 460}" y="112" text-anchor="middle" fill="#FFD86B" font-size="30" font-family="Jua">${fmt(v)}</text>`).join('')}
      <circle class="pt-marker" cx="-50" cy="60" r="16" fill="#FF9AC4"/><circle class="pt-true" cx="-50" cy="60" r="12" fill="#5ED3C7"/></svg></div>
      <div class="center"><button class="big-btn pt-lineok" disabled>That's my answer</button></div>`;
  const keys = q.type === 'num' || q.type === 'multi';
  const el = mount(html(`<section class="screen pt">${header(S)}
    <div class="pt-body ${keys ? 'with-keys' : ''}">
      <div class="pt-qside"><span class="tr-tag">${tag} · ${esc(SKILLS[q.skill].name)}</span><h2 class="pt-q">${esc(q.q)}</h2>${q.note ? `<p class="pt-note">${esc(q.note)}</p>` : ''}${q.pic ? `<div class="pt-picbox">${q.pic}</div>` : ''}${q.timed ? '<div class="pt-timer"><i></i></div>' : ''}</div>
      <div class="pt-aside">${area}</div>
    </div></section>`));
  on(el, '.pt-home', S.quit);
  let answered = false, timer = null;
  const submit = (v) => {
    if (answered) return;
    answered = true;
    clearTimeout(timer);
    const ok = isRightQ(q, v);
    const ms = Date.now() - t0;
    const mistake = !ok && v != null && q.tag ? q.tag(v) : null;
    record(m, q, ok, ms, mistake);
    S.results.push({ skill: q.skill, ok });
    if (ok) { S.coins += COIN_RIGHT; addCoins(COIN_RIGHT); }
    else if (S.retries < 2) {
      // a fresh question of the same kind comes back two steps later
      S.retries++;
      S.steps.splice(Math.min(S.i + 3, S.steps.length), 0, { type: 'q', skill: q.skill });
    }
    feedback(el, q, ok, v, mistake, done);
  };
  if (q.timed) {
    const bar = $(el, '.pt-timer i');
    requestAnimationFrame(() => { bar.style.transition = `width ${q.timed}s linear`; bar.style.width = '0%'; });
    timer = setTimeout(() => submit(null), q.timed * 1000);
    theoLine('timed');
  }
  if (q.type === 'choice') on(el, '.pt-opt', (b) => { b.classList.add('sel'); submit(+b.dataset.i); });
  if (keys) {
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
        if (vals.some((x) => x === '')) { cur = vals.findIndex((x) => x === ''); paint(); return; }
        return submit(q.type === 'num' ? +vals[0] : vals.map(Number));
      } else if (vals[cur].length < 7) vals[cur] += k;
      paint();
    });
  }
  if (q.type === 'line') {
    const svgEl = $(el, '.pt-line svg'), marker = $(el, '.pt-marker'), okb = $(el, '.pt-lineok');
    let v = null;
    svgEl.addEventListener('pointerdown', (e) => {
      if (answered) return;
      const r = svgEl.getBoundingClientRect();
      const cx = Math.max(40, Math.min(960, ((e.clientX - r.left) / r.width) * 1000));
      marker.setAttribute('cx', cx);
      v = Math.round(((cx - 40) / 920) * q.max);
      okb.disabled = false;
      sfx('pop');
    });
    on(el, '.pt-lineok', () => {
      if (v === null) return;
      $(el, '.pt-true').setAttribute('cx', 40 + (q.answer / q.max) * 920);
      submit(v);
    });
  }
}

function answerText(q) {
  if (q.type === 'choice') return q.options[q.answer];
  if (q.type === 'multi') return q.fields.map((f, i) => `${f} ${fmt(q.answer[i])}`).join('   ');
  if (q.type === 'line') return `${fmt(q.answer)} (the green dot)`;
  return fmt(q.answer);
}

function feedback(el, q, ok, v, mistake, done) {
  const ov = html(`<div class="pt-overlay tr-fb ${ok ? 'good' : 'bad'}"><div class="pt-modal">
    <h2 class="pt-h2">${ok ? `✅ ${PRAISE[Math.floor(Math.random() * PRAISE.length)]}` : v == null ? '⏰ Time’s up!' : '❌ Not quite'}</h2>
    ${ok ? `<p class="pt-lead">+⚽ ${COIN_RIGHT}</p>` : `${mistake && TAG_TIP[mistake] ? `<p class="tr-tip">${esc(TAG_TIP[mistake])}</p>` : ''}
      <p class="tr-ans">Answer: <b>${esc(answerText(q))}</b></p>
      ${q.picAfter ? `<div class="tr-fbpic">${q.picAfter}</div>` : ''}
      <p class="tr-explain">${esc(q.explain)}</p>`}
    <button class="big-btn tr-go">${ok ? 'Next' : 'Got it'}</button></div></div>`);
  el.appendChild(ov);
  if (ok) { sfx('ok'); burst($(ov, '.pt-modal'), 12); } else sfx('bad');
  on(ov, '.tr-go', () => { stop(); done(); });
  if (ok) setTimeout(() => { if (ov.isConnected) { ov.remove(); done(); } }, 1400);
}

async function finish(S, m, back) {
  m.sessions++;
  await saveMath(m);
  await addCoins(COIN_SESSION);
  S.coins += COIN_SESSION;
  const tp = await loadTheo();
  const right = S.results.filter((r) => r.ok).length;
  const ch = CHAPTERS.find((c) => c.id === S.chId);
  const pr = chapterProgress(m, ch);
  const el = mount(html(`<section class="screen pt center-col">
    <div class="pt-bwrap">${ballon({ equipped: tp.equipped, size: 200 })}</div>
    <h1 class="title" style="font-size:64px">Full time! ${right} / ${S.results.length} 🎉</h1>
    <p class="pt-lead">${esc(ch.name)}: ${pr >= 0.8 ? '⭐ Mastered!' : `${Math.round(pr * 100)}% there`}</p>
    <p class="pt-lead">${coinChip(tp.coins)} <span class="st-plus">+${S.coins}</span></p>
    <div class="row center" style="gap:20px"><button class="big-btn alt again">Train again</button><button class="big-btn home">Done</button></div>
  </section>`));
  sfx('star');
  burst($(el, '.title'), 24);
  theoLine('goal');
  setTimeout(() => celebrate($(el, '.pt-bwrap .ballon'), SHOP_BY_ID[tp.equipped.celebrate].cel), 300);
  on(el, '.again', async () => { const mm = await loadMath(); runSession(buildSession(mm, S.chId), mm, back); });
  on(el, '.home', () => trainHome(back));
}
