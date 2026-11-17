// One lesson = a list of steps built by the engine. Progress is saved after
// every step, so closing the app mid-lesson resumes at the same question.
import { app, html, mount, on, $, $$, talk, coinPill, burst, wait, esc } from './ui.js';
import { say, sfx, stop, hasClip } from './audio.js';
import { pick } from './lines.js';
import { ICON, mango, STICKERS, STICKER_SETS, STICKER_BY_ID } from './art.js';
import { ITEM_BY_ID, UNITS, PICTURE } from './curriculum.js';
import { compose, letterSound, syllableSimilarity, decompose } from './hangul.js';
import { m, makeStep, buildSpec, distractors, recordAnswer, markExposure, saveProfile, checkUnlocks, finishLessonDay } from './engine.js';
import { store } from './store.js';
import { traceActivity } from './trace.js';
import { readActivity } from './read.js';

const PALETTE = [['#FFD86B', 'rgba(255,216,107,0.6)'], ['#5ED3C7', 'rgba(94,211,199,0.6)'], ['#FF9AC4', 'rgba(255,154,196,0.6)'], ['#9EC5FF', 'rgba(158,197,255,0.6)'], ['#C8F27A', 'rgba(200,242,122,0.6)']];

let L = null; // current lesson
window.__lesson = () => L; // handy for testing

async function persist() { await store.set('lesson:tay', L); await saveProfile(app.profile); }

export async function runLesson(lesson) {
  L = lesson;
  await store.addEvent({ kid: 'tay', type: lesson.index === 0 ? 'lesson_start' : 'lesson_resume', lesson: L.id, unit: L.unit });
  await persist();
  next();
}

function prepare(step) {
  const p = app.profile;
  const item = ITEM_BY_ID[step.itemId];
  const struggling = L.wrongRun >= 2;
  if (step.partner && !step.choices) step.choices = [item.id, step.partner].sort(() => Math.random() - 0.5);
  if (!step.choices && !step.build && !step.cards && !step.fill && !['intro', 'trace', 'read'].includes(step.activity)) {
    Object.assign(step, makeStep(p, item, step.activity, struggling), { itemId: step.itemId, activity: step.activity });
  }
  return item;
}

function frame(item, { bubbleHint = '', body = '' }) {
  const p = app.profile;
  const pct = Math.round((L.index / L.steps.length) * 100);
  return html(`<section class="screen">
    <div class="row">
      <button class="round quit" aria-label="나가기">${ICON.close()}</button>
      <div class="progress" role="progressbar" aria-valuenow="${L.index}" aria-valuemax="${L.steps.length}">
        <div class="track"></div><div class="done" style="width:${pct}%"></div>
        <span class="ship" style="left:calc(${pct}% - 24px)">${ICON.rocket()}</span>
      </div>
      ${L.combo >= 2 ? `<span class="pill combo" aria-label="연속 ${L.combo}">${ICON.fire()} ${L.combo}</span>` : ''}
      ${coinPill(p.coins)}
    </div>
    <div class="row grow" style="gap:32px;align-items:stretch">
      <div class="guide">
        <div class="bubble"><button class="speak" aria-label="다시 듣기">${ICON.speaker()}</button>
          <span class="hint">${bubbleHint}</span></div>
        ${mango({ equipped: p.equipped, size: 200 })}
      </div>
      <div class="stagebox">${body}</div>
    </div>
  </section>`);
}

function bindQuit(el) {
  on(el, '.quit', async () => { stop(); await persist(); app.go('map'); });
}

async function next() {
  if (L.index >= L.steps.length) return finish();
  const step = L.steps[L.index];
  const item = prepare(step);
  await persist();
  const run = { intro, listen: choose, sight: choose, picture: choose, build, trace: traceStep, read: readStep, stars, balloon, memory, fill }[step.activity] || choose;
  run(step, item);
}

// Called by every activity when the step is over.
async function done(step, item, { correct, ms, chosen = null, weight = 1, extra = {} }) {
  const p = app.profile;
  if (weight > 0) recordAnswer(p, item.id, { correct, ms, chosen, weight });
  await store.addEvent({ kid: 'tay', type: 'answer', lesson: L.id, unit: item.unit, item: item.id, activity: step.activity, correct, ms, chosen, weight, score: m(p, item.id).score, ...extra });
  L.results.push({ item: item.id, activity: step.activity, correct });
  if (correct) {
    L.wrongRun = 0;
    L.combo++;
    L.bestCombo = Math.max(L.bestCombo || 0, L.combo);
    p.coins += 5; L.coinsEarned += 5;
    if (L.combo % 3 === 0) { p.coins += 3; L.coinsEarned += 3; sfx('coin'); await say(pick('combo')); }
  } else {
    L.wrongRun++;
    L.combo = 0;
    // give a missed item another, easier go a little later in this lesson
    const retries = L.steps.filter((s) => s.retry).length;
    if (weight >= 0.5 && retries < 2 && !step.retry) {
      const at = Math.min(L.steps.length, L.index + 3);
      L.steps.splice(at, 0, { itemId: item.id, activity: 'listen', retry: true });
    }
  }
  L.index++;
  await persist();
  next();
}

async function finish() {
  const p = app.profile;
  finishLessonDay(p);
  const scored = L.results.filter((r) => r.activity !== 'intro');
  const accuracy = scored.length ? scored.filter((r) => r.correct).length / scored.length : 1;
  p.coins += 20; L.coinsEarned += 20;
  // one sticker per finished lesson, sets in order
  let sticker = null;
  for (const set of STICKER_SETS) {
    const left = STICKERS.filter((s) => s.set === set && !p.stickers.includes(s.id));
    if (left.length) { sticker = left[0].id === 'mango' ? 'mango' : left[Math.floor(Math.random() * left.length)].id; break; }
  }
  if (sticker) p.stickers.push(sticker);
  const unlocked = checkUnlocks(p)[0] || null;
  await saveProfile(p);
  await store.del('lesson:tay');
  await store.addEvent({ kid: 'tay', type: 'lesson_end', lesson: L.id, unit: L.unit, stage: L.stage, accuracy, coins: L.coinsEarned, sticker, unlocked, steps: L.steps.length });
  const coins = L.coinsEarned;
  const L_stage = L.stage;
  const bestCombo = L.bestCombo || 0;
  L = null;
  app.go('reward', { accuracy, coins, sticker, unlocked, stage: L_stage, bestCombo });
}

function sound(item) { return item.text; }

// ---- intro: meet a new letter block ----------------------------------------------
function intro(step, item) {
  markExposure(app.profile, item.id);
  const parts = item.parts ? item.parts.map((j) => `<button class="tile big part" data-j="${j}" style="background:#FF8A3D;font-size:120px;width:170px;height:190px">${j}</button>`).join('<span class="op">+</span>') : '';
  const el = mount(frame(item, {
    bubbleHint: '새 글자야! 눌러서 들어 봐!',
    body: `<div class="board">${parts ? parts + '<span class="op">=</span>' : ''}
      <button class="tile huge main" style="background:#7B5CFA;box-shadow:0 0 40px rgba(123,92,250,0.8)">${esc(item.text)}</button></div>
      <div class="center"><button class="big-btn ok">${ICON.check('#151B3D')} 알았어!</button></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('intro_new'), sound(item), sound(item));
  play();
  on(el, '.speak', play);
  on(el, '.main', () => { sfx('pop'); say(sound(item)); });
  on(el, '.part', (b) => { sfx('pop'); say(letterSound(b.dataset.j)); });
  on(el, '.ok', async () => {
    sfx('ok');
    stop();
    await store.addEvent({ kid: 'tay', type: 'answer', lesson: L.id, unit: item.unit, item: item.id, activity: 'intro', correct: true, weight: 0 });
    L.results.push({ item: item.id, activity: 'intro', correct: true });
    L.index++;
    await persist();
    next();
  });
}

// ---- listen & pick / sight match ----------------------------------------------------
function choose(step, item) {
  const picture = step.activity === 'picture';
  const listen = step.activity === 'listen';
  const cls = item.kind === 'syl' ? '' : item.kind === 'word' ? 'word' : 'sentence';
  const choices = step.choices.map((id, i) => {
    const it = ITEM_BY_ID[id];
    const [bg, glow] = PALETTE[i % PALETTE.length];
    return `<button class="choice ${cls}" data-id="${esc(id)}" style="background:${bg};--glow:${glow}">${esc(it.text)}</button>`;
  }).join('');
  const target = listen
    ? `<button class="speak again" aria-label="소리 다시 듣기" style="width:170px;height:170px">${ICON.speaker()}</button>`
    : picture ? `<div class="picframe">${STICKER_BY_ID[PICTURE[item.text]].svg()}</div>`
    : `<div class="tile huge" style="background:#FF8A3D;box-shadow:0 0 36px rgba(255,138,61,0.6)">${esc(item.text)}</div>`;
  const el = mount(frame(item, {
    bubbleHint: listen ? '잘 듣고 골라 봐!' : picture ? '그림에 맞는 낱말은?' : '똑같은 글자를 찾아 봐!',
    body: `<div class="board" style="flex-direction:column;gap:30px">${target}</div><div class="choices">${choices}</div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const instr = listen ? pick(item.kind === 'syl' ? 'listen' : 'listen_word') : picture ? pick('picture') : pick('sight');
  const play = () => talk(speak, instr, listen ? sound(item) : null);
  play();
  on(el, '.speak:not(.again)', play);
  on(el, '.again', () => say(sound(item)));
  const t0 = Date.now();
  let misses = 0, firstChoice = null, locked = false;
  on(el, '.choice', async (b) => {
    if (locked) return;
    const id = b.dataset.id;
    if (firstChoice === null) firstChoice = id;
    if (id === item.id) {
      locked = true;
      b.classList.add('good');
      sfx('ok');
      burst($(el, '.board'));
      await say(pick('correct'), sound(item));
      done(step, item, { correct: misses === 0, ms: Date.now() - t0, chosen: misses ? firstChoice : null });
    } else {
      misses++;
      b.classList.add('bad');
      sfx('bad');
      if (misses === 1) {
        await say(pick('wrong'), sound(item));
      } else {
        locked = true;
        const good = $(el, `.choice[data-id="${CSS.escape(item.id)}"]`);
        good.classList.add('good');
        await say(pick('show_answer'), sound(item), sound(item));
        done(step, item, { correct: false, ms: Date.now() - t0, chosen: firstChoice });
      }
    }
  });
}

// ---- build: put the blocks together ---------------------------------------------
function build(step, item) {
  const b = step.build;
  if (b.type === 'jamo') return buildJamo(step, item, b);
  return buildOrder(step, item, b);
}

function buildJamo(step, item, b) {
  const cells = b.parts.map((j, i) => i === b.slot
    ? `<div class="tile slot" data-slot>?</div>`
    : `<button class="tile big part" data-j="${j}" style="background:#FF8A3D;box-shadow:0 0 36px rgba(255,138,61,0.6)">${j}</button>`).join('<span class="op">+</span>');
  const opts = b.options.map((j, i) => {
    const [bg, glow] = PALETTE[i % PALETTE.length];
    return `<button class="choice" data-j="${j}" style="background:${bg};--glow:${glow}">${j}</button>`;
  }).join('');
  const el = mount(frame(item, {
    bubbleHint: '블록을 붙여서 만들어 봐!',
    body: `<div class="board">${cells}<span class="op">=</span><button class="tile answer" aria-label="소리 듣기">?</button></div><div class="choices">${opts}</div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('build'), sound(item));
  play();
  on(el, '.speak', play);
  on(el, '.part', (x) => say(letterSound(x.dataset.j)));
  on(el, '.answer', () => say(sound(item)));
  const t0 = Date.now();
  let misses = 0, first = null, locked = false;
  on(el, '.choice', async (x) => {
    if (locked) return;
    const j = x.dataset.j;
    const slot = $(el, '[data-slot]');
    if (first === null) first = j;
    const parts = b.parts.slice(); parts[b.slot] = j;
    const made = compose(parts[0], parts[1], parts[2] || '');
    if (j === b.parts[b.slot]) {
      locked = true;
      slot.textContent = j;
      slot.style.borderStyle = 'solid';
      const ans = $(el, '.answer');
      ans.textContent = item.text;
      ans.style.background = '#7B5CFA'; ans.style.color = '#FFFFFF';
      sfx('ok');
      burst($(el, '.board'));
      await say(item.text, pick('correct'));
      done(step, item, { correct: misses === 0, ms: Date.now() - t0, chosen: misses ? wrongId(item, first) : null });
    } else {
      misses++;
      x.classList.add('bad');
      sfx('bad');
      // let him hear what he made, then the target
      if (made && await hasClip(made)) await say(made);
      if (misses === 1) await say(pick('wrong'), sound(item));
      else {
        locked = true;
        slot.textContent = b.parts[b.slot];
        $(el, '.answer').textContent = item.text;
        await say(pick('show_answer'), item.text);
        done(step, item, { correct: false, ms: Date.now() - t0, chosen: wrongId(item, first) });
      }
    }
  });
}

// Turn a wrong jamo choice into the syllable it made, for the mix-up tracker.
function wrongId(item, j) {
  if (!item.parts || !j) return null;
  const b = decompose(item.text);
  const variants = [compose(j, b.v, b.t), compose(b.c, j, b.t), compose(b.c, b.v, j)].filter(Boolean);
  const hit = variants.find((t) => ITEM_BY_ID[`syl:${t}`]);
  return hit ? `syl:${hit}` : null;
}

function buildOrder(step, item, b) {
  const sentence = item.kind === 'sentence';
  const opts = b.options.map((t, i) => {
    const [bg, glow] = PALETTE[i % PALETTE.length];
    return `<button class="choice ${sentence ? 'sentence' : 'word'}" data-i="${i}" style="background:${bg};--glow:${glow}">${esc(t)}</button>`;
  }).join('');
  const slots = b.tiles.map(() => `<div class="tile empty"></div>`).join('');
  const el = mount(frame(item, {
    bubbleHint: sentence ? '순서대로 눌러 봐!' : '글자를 순서대로 눌러 봐!',
    body: `<div class="board" style="flex-direction:column"><button class="speak again" aria-label="소리 다시 듣기">${ICON.speaker()}</button>
      <div class="word-line ${sentence ? 'sentence' : ''}">${slots}</div></div><div class="choices">${opts}</div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick(sentence ? 'build_sentence' : 'build_word'), sound(item));
  play();
  on(el, '.speak:not(.again)', play);
  on(el, '.again', () => say(sound(item)));
  const t0 = Date.now();
  let pos = 0, misses = 0, locked = false;
  on(el, '.choice', async (x) => {
    if (locked) return;
    const t = b.options[+x.dataset.i];
    if (t === b.tiles[pos]) {
      const slot = $$(el, '.word-line .tile')[pos];
      slot.textContent = t; slot.classList.remove('empty');
      x.classList.add('used');
      sfx('pop');
      if (!sentence || await hasClip(t)) say(t);
      pos++;
      if (pos === b.tiles.length) {
        locked = true;
        burst($(el, '.board'));
        await wait(500);
        await say(item.text, pick('correct'));
        done(step, item, { correct: misses === 0, ms: Date.now() - t0 });
      }
    } else {
      misses++;
      x.classList.add('bad');
      setTimeout(() => x.classList.remove('bad'), 400);
      sfx('bad');
      await say(pick('wrong'), sound(item));
      if (misses >= 3) {
        locked = true;
        $$(el, '.word-line .tile').forEach((s, i) => { s.textContent = b.tiles[i]; s.classList.remove('empty'); });
        await say(pick('show_answer'), item.text);
        done(step, item, { correct: false, ms: Date.now() - t0 });
      }
    }
  });
}

// ---- trace & read live in their own files ------------------------------------------
function traceStep(step, item) {
  const el = mount(frame(item, {
    bubbleHint: '손가락으로 따라 써 봐!',
    body: `<div class="board" style="flex-direction:column;gap:18px"><div class="trace-wrap"></div>
      <div class="tools"><button class="tool erase" style="background:#2A3266" aria-label="지우기">${ICON.erase()}</button>
      <button class="tool check" style="background:#4CC76B" aria-label="다 썼어">${ICON.check()}</button></div></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('trace'), sound(item));
  play();
  on(el, '.speak', play);
  traceActivity($(el, '.trace-wrap'), item.text, {
    erase: $(el, '.erase'),
    check: $(el, '.check'),
    onResult: async ({ ok, tries, coverage, outside }) => {
      const extra = { coverage, outside, tries };
      if (ok) {
        sfx('ok'); burst($(el, '.board'));
        await say(pick('correct'), item.text);
        done(step, item, { correct: tries === 1, weight: 0.5, extra });
        return true;
      }
      if (tries < 2) { sfx('bad'); await say(pick('trace_retry')); return false; }
      await say(pick('read_try'), item.text);
      done(step, item, { correct: false, weight: 0.3, extra });
      return true;
    }
  });
}

function readStep(step, item) {
  const big = item.kind === 'syl' ? 'huge' : '';
  const fs = item.kind === 'sentence' ? 'font-size:84px' : item.kind === 'word' ? 'font-size:130px' : '';
  const el = mount(frame(item, {
    bubbleHint: '소리 내서 읽어 봐!',
    body: `<div class="board" style="flex-direction:column;gap:26px">
      <div class="tile ${big}" style="background:#7B5CFA;padding:10px 40px;min-height:200px;${fs}">${esc(item.text)}</div>
      <button class="mic" aria-label="마이크">${ICON.mic()}</button></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick(item.kind === 'syl' ? 'read' : 'read_word'));
  play();
  on(el, '.speak', play);
  readActivity($(el, '.mic'), item, {
    onListening: () => say(pick('listening')),
    onResult: async (r) => {
      const extra = { heard: r.heard, verdict: r.verdict, asr: r.asr };
      if (r.verdict === 'good') {
        sfx('ok'); burst($(el, '.board'));
        await say(pick('read_good'), item.text);
        done(step, item, { correct: true, weight: r.tries === 1 ? 0.6 : 0.4, extra });
        return true;
      }
      if (r.verdict === 'close' && r.tries < 2) { await say(pick('read_close'), item.text); return false; }
      if (r.verdict === 'none' && r.tries < 2) { await say(pick('read_try'), item.text); return false; }
      // never punish hard for the mic: small weight, and 망고 models it
      await say(pick('read_try'), item.text);
      done(step, item, { correct: false, weight: r.asr ? 0.25 : 0, extra });
      return true;
    }
  });
}

// ---- 별똥별 잡기: tap the falling star that carries the sound ----------------------
function stars(step, item) {
  const lanes = step.choices.length;
  const cls = item.kind === 'syl' ? '' : 'word';
  const starsHtml = step.choices.map((id, i) => {
    const [bg] = PALETTE[i % PALETTE.length];
    const delay = (i * 0.9 + Math.random() * 0.6).toFixed(2);
    return `<button class="falling ${cls}" data-id="${esc(id)}" style="left:${8 + (i * 84) / lanes}%;animation-delay:-${delay}s;--c:${bg}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.5 6.6-.8z" fill="${bg}"/></svg>
      <span>${esc(ITEM_BY_ID[id].text)}</span></button>`;
  }).join('');
  const el = mount(frame(item, {
    bubbleHint: '소리를 듣고 별똥별을 잡아!',
    body: `<div class="board sky-game">${starsHtml}<button class="speak again" aria-label="소리 다시 듣기" style="position:absolute;right:20px;bottom:20px">${ICON.speaker()}</button></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('stars'), sound(item));
  play();
  on(el, '.speak:not(.again)', play);
  on(el, '.again', () => say(sound(item)));
  const t0 = Date.now();
  let misses = 0, first = null, locked = false;
  on(el, '.falling', async (b) => {
    if (locked) return;
    const id = b.dataset.id;
    if (first === null) first = id;
    if (id === item.id) {
      locked = true;
      b.classList.add('caught');
      sfx('star'); burst($(el, '.board'));
      await say(pick('correct'), sound(item));
      done(step, item, { correct: misses === 0, ms: Date.now() - t0, chosen: misses ? first : null });
    } else {
      misses++;
      b.classList.add('poof');
      sfx('bad');
      if (misses === 1) await say(pick('wrong'), sound(item));
      else {
        locked = true;
        $(el, `.falling[data-id="${CSS.escape(item.id)}"]`).classList.add('caught');
        await say(pick('show_answer'), sound(item));
        done(step, item, { correct: false, ms: Date.now() - t0, chosen: first });
      }
    }
  });
}

// ---- 풍선 터뜨리기: pop every balloon with the sound -----------------------------
function balloon(step, item) {
  const total = step.choices.filter((id) => id === item.id).length;
  const cls = item.kind === 'syl' ? '' : 'word';
  const colors = ['#FF5D73', '#FFD86B', '#5ED3C7', '#9EC5FF', '#FF9AC4', '#C8F27A'];
  const balloons = step.choices.map((id, i) => `<button class="balloon ${cls}" data-id="${esc(id)}" style="--c:${colors[i % colors.length]};animation-delay:-${(i * 0.7).toFixed(1)}s">
      <span class="b-body">${esc(ITEM_BY_ID[id].text)}</span><span class="b-string"></span></button>`).join('');
  const el = mount(frame(item, {
    bubbleHint: `이 소리 풍선을 모두 터뜨려! (${total}개)`,
    body: `<div class="board balloons">${balloons}<button class="speak again" aria-label="소리 다시 듣기" style="position:absolute;right:20px;top:20px">${ICON.speaker()}</button></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('balloon'), sound(item));
  play();
  on(el, '.speak:not(.again)', play);
  on(el, '.again', () => say(sound(item)));
  const t0 = Date.now();
  let popped = 0, misses = 0, first = null, locked = false;
  on(el, '.balloon', async (b) => {
    if (locked || b.classList.contains('popped')) return;
    const id = b.dataset.id;
    if (id === item.id) {
      b.classList.add('popped');
      sfx('pop');
      popped++;
      if (popped === total) {
        locked = true;
        burst($(el, '.board'));
        await say(pick('correct'), sound(item));
        done(step, item, { correct: misses === 0, ms: Date.now() - t0, chosen: misses ? first : null });
      } else say(sound(item));
    } else {
      if (first === null) first = id;
      misses++;
      b.classList.add('bad');
      setTimeout(() => b.classList.remove('bad'), 400);
      sfx('bad');
      await say(pick('balloon_wrong'), sound(item));
      if (misses >= 3) {
        locked = true;
        $$(el, `.balloon[data-id="${CSS.escape(item.id)}"]`).forEach((x) => x.classList.add('popped'));
        await say(pick('show_answer'), sound(item));
        done(step, item, { correct: false, ms: Date.now() - t0, chosen: first });
      }
    }
  });
}

// ---- 짝 맞추기: memory cards; every flip says the card out loud -------------------
function memory(step, item) {
  const cls = item.kind === 'syl' ? '' : 'word';
  const cards = step.cards.map((id, i) => `<button class="card-flip ${cls}" data-id="${esc(id)}" data-i="${i}" aria-label="카드">
      <span class="back">${ICON.star('#FFD86B')}</span><span class="front">${esc(ITEM_BY_ID[id].text)}</span></button>`).join('');
  const el = mount(frame(item, {
    bubbleHint: '똑같은 글자 짝을 찾아!',
    body: `<div class="board"><div class="cards c${step.cards.length}">${cards}</div></div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('memory'));
  play();
  on(el, '.speak', play);
  const t0 = Date.now();
  let open = [], matched = 0, flips = 0, busy = false;
  const pairs = step.pairs.length;
  on(el, '.card-flip', async (c) => {
    if (busy || c.classList.contains('up') || c.classList.contains('matched')) return;
    c.classList.add('up');
    flips++;
    sfx('pop');
    open.push(c);
    say(ITEM_BY_ID[c.dataset.id].text);
    if (open.length < 2) return;
    busy = true;
    const [a, b] = open;
    open = [];
    await wait(700);
    if (a.dataset.id === b.dataset.id) {
      a.classList.add('matched'); b.classList.add('matched');
      sfx('ok');
      matched++;
      if (matched < pairs) { busy = false; say(pick('memory_match'), ITEM_BY_ID[a.dataset.id].text); return; }
      await say(pick('memory_match'), ITEM_BY_ID[a.dataset.id].text);
      {
        burst($(el, '.board'));
        await say(pick('correct'));
        // good memory = few extra flips
        done(step, item, { correct: flips <= pairs * 2 + 4, ms: Date.now() - t0, weight: 0.5, extra: { flips } });
        return;
      }
    } else {
      a.classList.remove('up'); b.classList.remove('up');
    }
    busy = false;
  });
}

// ---- 빈칸 채우기: which syllable is missing from the word? -------------------------
function fill(step, item) {
  const f = step.fill;
  const syl = [...item.text.replace(/ /g, '')];
  const word = syl.map((ch, i) => i === f.at
    ? `<div class="tile empty" data-slot>?</div>` : `<div class="tile">${esc(ch)}</div>`).join('');
  const opts = f.options.map((t, i) => {
    const [bg, glow] = PALETTE[i % PALETTE.length];
    return `<button class="choice" data-t="${esc(t)}" style="background:${bg};--glow:${glow}">${esc(t)}</button>`;
  }).join('');
  const pic = PICTURE[item.text] ? `<div class="picframe small">${STICKER_BY_ID[PICTURE[item.text]].svg()}</div>` : '';
  const el = mount(frame(item, {
    bubbleHint: '빈칸에 들어갈 글자는?',
    body: `<div class="board" style="flex-direction:column;gap:20px">${pic}<div class="word-line">${word}</div>
      <button class="speak again small" aria-label="낱말 듣기">${ICON.speaker()}</button></div><div class="choices">${opts}</div>`
  }));
  bindQuit(el);
  const speak = $(el, '.speak');
  const play = () => talk(speak, pick('fill'), sound(item));
  play();
  on(el, '.speak:not(.again)', play);
  on(el, '.again', () => say(sound(item)));
  const t0 = Date.now();
  let misses = 0, locked = false;
  on(el, '.choice', async (b) => {
    if (locked) return;
    const slot = $(el, '[data-slot]');
    if (b.dataset.t === f.answer) {
      locked = true;
      slot.textContent = f.answer; slot.classList.remove('empty');
      sfx('ok'); burst($(el, '.board'));
      await say(item.text, pick('correct'));
      done(step, item, { correct: misses === 0, ms: Date.now() - t0 });
    } else {
      misses++;
      b.classList.add('bad');
      sfx('bad');
      if (misses === 1) await say(pick('wrong'), item.text);
      else {
        locked = true;
        slot.textContent = f.answer; slot.classList.remove('empty');
        await say(pick('show_answer'), item.text);
        done(step, item, { correct: false, ms: Date.now() - t0 });
      }
    }
  });
}
