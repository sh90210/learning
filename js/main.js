import { app, html, mount, on, $, $$, talk, coinPill, burst, fitStage, drawSky, esc, wait } from './ui.js';
import { say, setVoice, sfx } from './audio.js';
import { pick } from './lines.js';
import { mango, ICON, STICKERS, STICKER_SETS, STICKER_BY_ID, SHOP, SHOP_BY_ID, SLOT_NAMES, shopIcon } from './art.js';
import { UNITS, STAGE_BY_ID, COMING, picUrl } from './curriculum.js';
import { loadProfile, saveProfile, currentUnit, currentStage, unitProgress, stageProgress, buildLesson } from './engine.js';
import { store } from './store.js';
import { runLesson } from './lesson.js';
import { grownups } from './grownups.js';

const screens = {};
app.go = (name, arg) => screens[name](arg);

// ---- splash: one tap unlocks sound on the tablet ----------------------------
screens.splash = () => {
  const el = mount(html(`<section class="screen splash">
    <h1 class="title" style="font-size:88px">태오랑 태이랑</h1>
    <button class="start" aria-label="시작">${mango({ size: 300 })}</button>
    <div class="big-btn">${ICON.star('#151B3D')} 눌러서 시작!</div>
  </section>`));
  const start = async () => { sfx('pop'); store.persist(); app.go('entry'); };
  on(el, '.start', start);
  on(el, '.big-btn', start);
};

// ---- who's learning? ---------------------------------------------------------
screens.entry = async () => {
  const tay = await loadProfile('tay');
  const el = mount(html(`<section class="screen">
    <div class="row center" style="gap:18px">
      <h1 class="title" style="font-size:76px">태오랑 태이랑</h1>
      <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button>
    </div>
    <div class="who">
      <button class="kid" data-kid="tay" aria-label="태이">
        <svg class="planet" viewBox="0 0 380 320" aria-hidden="true"><ellipse cx="190" cy="165" rx="185" ry="44" fill="none" stroke="#FFD86B" stroke-width="10" opacity="0.55"/><circle cx="190" cy="150" r="130" fill="#FF8A3D"/><circle cx="140" cy="100" r="22" fill="#FFB37A"/><circle cx="240" cy="210" r="16" fill="#E86A1E"/><path d="M8 165 A185 44 0 0 0 372 165" fill="none" stroke="#FFD86B" stroke-width="10"/><text x="190" y="192" text-anchor="middle" font-family="Jua" font-size="120" fill="#FFFFFF">가</text></svg>
        <span>태이</span><small>${ICON.star()} ${tay.coins}</small>
      </button>
      <button class="kid locked" data-kid="theo" aria-label="태오, 곧 열려요">
        <svg class="planet" viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="150" r="130" fill="#2BB5A8" opacity="0.6"/><circle cx="110" cy="110" r="20" fill="#5ED3C7" opacity="0.6"/><text x="160" y="182" text-anchor="middle" font-family="Jua" font-size="90" fill="#FFFFFF" opacity="0.85">1+2</text></svg>
        <span>태오</span><small>${ICON.lock()} 곧 열려요</small>
      </button>
    </div>
    <button class="grownup" aria-label="어른용, 2초 동안 누르세요"><span class="fill"></span>${ICON.lock()}<span style="position:relative">어른용</span></button>
  </section>`));
  const speak = $(el, '.speak');
  talk(speak, pick('who'));
  on(el, '.speak', () => talk(speak, pick('who')));
  on(el, '[data-kid="tay"]', async () => { sfx('pop'); await say(pick('name_tay')); app.go('map', { greet: true }); });
  on(el, '[data-kid="theo"]', () => { sfx('pop'); talk(speak, pick('name_theo'), pick('theo_soon')); });
  holdToOpen($(el, '.grownup'), () => grownups());
};

function holdToOpen(btn, fn) {
  let timer = null;
  const start = (e) => { e.preventDefault(); btn.classList.add('holding'); timer = setTimeout(() => { btn.classList.remove('holding'); fn(); }, 2000); };
  const cancel = () => { btn.classList.remove('holding'); clearTimeout(timer); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
}

// ---- 태이's map --------------------------------------------------------------
// stops on 망고 섬, left to right; chapters fill them in order, the rest are "?"
const POS = [[230, 330], [440, 200], [640, 330], [850, 210], [1030, 330]];

function starsFor(share) { return share >= 0.8 ? 3 : share >= 0.5 ? 2 : share >= 0.2 ? 1 : 0; }
const starRow = (n) => [0, 1, 2].map((k) => ICON.star(k < n ? '#FFD86B' : 'rgba(255,255,255,0.18)')).join('');

// tap 망고 anywhere and he dances
function bindDance(el) {
  on(el, '.mango-btn', (b) => {
    const svg = b.querySelector('.mango');
    svg.classList.remove('dancing'); void svg.getBoundingClientRect(); svg.classList.add('dancing');
    sfx('star');
    say(pick('dance'));
    setTimeout(() => svg.classList.remove('dancing'), 2600);
  });
}

// ---- 태이's map: every planet is open; the recommended one glows -------------------
screens.map = async ({ greet = false } = {}) => {
  const p = app.profile = await loadProfile('tay');
  const cur = currentUnit(p);
  const saved = await store.get('lesson:tay');
  const nStops = Math.min(POS.length, UNITS.length + COMING);
  let path = '';
  for (let i = 1; i < nStops; i++) path += `<line x1="${POS[i - 1][0]}" y1="${POS[i - 1][1]}" x2="${POS[i][0]}" y2="${POS[i][1]}" stroke="rgba(255,255,255,0.45)" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>`;
  const stops = POS.slice(0, nStops).map(([x, y], i) => {
    const u = UNITS[i];
    if (!u) return `<div class="stop soon" style="left:${x}px;top:${y}px"><span class="badge">?</span></div>`;
    const prog = unitProgress(p, u);
    return `<button class="stop ${u.id === cur.id ? 'current' : ''}" data-unit="${u.id}" style="left:${x}px;top:${y}px;--c:${u.color}" aria-label="${esc(u.name)}">
      <span class="badge"><img class="wpic" src="${picUrl(u.pic)}" alt=""></span>
      <span class="name">${esc(u.name)}</span>
      <span class="stars">${starRow(starsFor(prog.share))}</span>
    </button>`;
  }).join('');
  const island = `<svg class="island" width="1180" height="520" viewBox="0 0 1180 520" aria-hidden="true">
    <ellipse cx="590" cy="300" rx="560" ry="190" fill="#2BB5A8" opacity="0.25"/>
    <path d="M70 300 C120 150 330 90 590 100 C860 110 1080 160 1110 300 C1090 420 860 470 590 470 C330 470 90 430 70 300Z" fill="#3C8F4F"/>
    <path d="M100 300 C150 170 340 120 590 128 C850 136 1050 180 1080 300 C1060 400 850 440 590 440 C340 440 120 400 100 300Z" fill="#5BBF6A"/>
    <path d="M70 300 C90 430 330 480 590 480 C860 480 1090 430 1110 300 L1110 330 C1080 470 860 515 590 515 C330 515 100 470 70 330Z" fill="#B07A4A"/>
    <g fill="#2E7D44"><circle cx="160" cy="250" r="28"/><circle cx="1000" cy="420" r="30"/><circle cx="560" cy="430" r="24"/><circle cx="760" cy="150" r="22"/></g>
    <g fill="#FFD86B" opacity="0.9"><circle cx="330" cy="420" r="8"/><circle cx="920" cy="150" r="7"/><circle cx="120" cy="360" r="6"/></g>
  </svg>`;
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="처음으로">${ICON.back()}</button>
      <div class="grow"></div>
      ${coinPill(p.coins)}
    </div>
    <div class="map">
      ${island}
      <svg class="map-path" width="1200" height="560" aria-hidden="true">${path}</svg>
      ${stops}
    </div>
    <div class="row">
      <div class="row" style="gap:6px"><button class="mango-btn" aria-label="망고 춤">${mango({ equipped: p.equipped, size: 160 })}</button>
        <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button></div>
      <div class="grow"></div>
      <div class="dock">
        <button class="dock-btn" data-go="stickers" aria-label="스티커 책">${ICON.book()}</button>
        <button class="dock-btn" data-go="shop" aria-label="망고 옷 가게">${ICON.shop()}</button>
      </div>
      <button class="big-btn go" aria-label="출발">${ICON.rocket()} 출발!</button>
    </div>
  </section>`));
  const speak = $(el, '.speak');
  const intro = saved ? pick('welcome_back') : greet ? pick('hello') : pick('island');
  talk(speak, intro, greet && !saved ? pick('island') : null);
  on(el, '.speak', () => talk(speak, pick('map_go')));
  on(el, '.back', () => app.go('entry'));
  on(el, '[data-go]', (b) => app.go(b.dataset.go));
  bindDance(el);
  on(el, '.go', () => { sfx('pop'); runLesson(saved || buildLesson(p, cur.id)); });
  on(el, '.stop[data-unit]', (b) => { sfx('pop'); app.go('planet', b.dataset.unit); });
  on(el, '.stop.soon', () => { sfx('bad'); });
};

// ---- one planet: its short stages, all open, with arrows to the next/previous planet --
screens.planet = async (unitId) => {
  const p = app.profile || (app.profile = await loadProfile('tay'));
  const i = UNITS.findIndex((u) => u.id === unitId);
  const u = UNITS[i];
  const rec = currentStage(p, u);
  const saved = await store.get('lesson:tay');
  const n = u.stages.length;
  const stones = u.stages.map((st, k) => {
    const pr = stageProgress(p, st);
    const x = n === 1 ? 50 : 12 + (k * 76) / (n - 1);
    const y = k % 2 ? 330 : 200;
    const label = st.items.map((it) => it.text).join(' ');
    const thumbs = st.items.map((it) => (it.media ? `<img src="${picUrl(it.media)}" alt="">` : '')).join('');
    return `<button class="stone ${st.id === rec.id ? 'current' : ''}" data-stage="${st.id}" style="left:${x}%;top:${y}px;--c:${u.color}" aria-label="${k + 1}단계">
      <span class="num ${st.review ? 'review' : ''}">${st.review ? '모두' : k + 1}</span>
      ${thumbs ? `<span class="thumbs">${thumbs}</span>` : `<span class="peek">${esc(label)}</span>`}
      <span class="stars">${starRow(starsFor(pr.share))}</span></button>`;
  }).join('');
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="지도로">${ICON.back()}</button>
      <span class="orb-mini" style="background:${u.color}">${u.pic ? `<img class="wpic" src="${picUrl(u.pic)}" alt="">` : esc(u.icon)}</span>
      <h1 class="title" style="font-size:52px">${esc(u.name)}</h1>
      <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button>
      <div class="grow"></div>${coinPill(p.coins)}
    </div>
    <div class="row grow" style="gap:18px">
      <button class="round nav prev" ${i === 0 ? 'disabled' : ''} aria-label="이전 행성">${ICON.prev()}</button>
      <div class="stones grow">${stones}</div>
      <button class="round nav next" ${i === UNITS.length - 1 ? 'disabled' : ''} aria-label="다음 행성">${ICON.next()}</button>
    </div>
  </section>`));
  const speak = $(el, '.speak');
  talk(speak, u.name, pick(`ch_${u.id}`), pick('planet'));
  on(el, '.speak', () => talk(speak, pick(`ch_${u.id}`), pick('planet')));
  on(el, '.back', () => app.go('map'));
  on(el, '.prev', () => i > 0 && app.go('planet', UNITS[i - 1].id));
  on(el, '.next', () => i < UNITS.length - 1 && app.go('planet', UNITS[i + 1].id));
  on(el, '.stone', async (b) => {
    sfx('pop');
    if (saved) await store.del('lesson:tay');
    runLesson(buildLesson(p, u.id, b.dataset.stage));
  });
};

// ---- reward: stars, coins, sticker, a treasure chest, and 망고 dancing ----------------
screens.reward = async ({ accuracy, coins, sticker, unlocked, stage, bestCombo = 0 }) => {
  const p = app.profile;
  const stars = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;
  const st = sticker ? STICKER_BY_ID[sticker] : null;
  const el = mount(html(`<section class="screen reward" style="gap:16px">
    <div class="row" style="gap:40px;align-items:center">
      <button class="mango-btn" aria-label="망고 춤">${mango({ equipped: p.equipped, size: 230, dancing: true })}</button>
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
        <div class="stars-row">${[0, 1, 2].map((k) => `<span class="${k === 1 ? 'mid' : ''}">${ICON.star(k < stars ? '#FFD86B' : 'rgba(255,255,255,0.2)')}</span>`).join('')}</div>
        <h1 class="title" style="font-size:66px">잘했어, 태이야!</h1>
        <div class="row" style="gap:24px"><div class="coin-burst">${ICON.star()} +<b class="earned">${coins}</b></div>
          ${bestCombo >= 3 ? `<div class="pill combo" style="font-size:34px">${ICON.fire()} ${bestCombo}</div>` : ''}</div>
      </div>
      <button class="chest" aria-label="보물 상자">${ICON.chest()}</button>
    </div>
    ${st ? `<button class="panel sticker-card" aria-label="${esc(st.word)}"><span class="pic">${st.svg()}</span><span class="w">${esc(st.word)}</span></button>` : ''}
    <div class="row" style="gap:24px">
      ${st ? `<button class="big-btn" data-go="stickers">${ICON.book('#151B3D')} 스티커 책</button>` : ''}
      <button class="big-btn again" style="background:#FF9AC4">${ICON.rocket()} 한 번 더</button>
      <button class="big-btn" data-go="map" style="background:#5ED3C7">${ICON.back()} 지도로</button>
    </div>
  </section>`));
  el.querySelectorAll('.stars-row span').forEach((x) => x.querySelector('svg').classList.toggle('mid', x.classList.contains('mid')));
  burst(el, 16);
  bindDance(el);
  let opened = false;
  on(el, '.chest', async (b) => {
    if (opened) return;
    opened = true;
    const bonus = 10 + Math.floor(Math.random() * 3) * 10;
    p.coins += bonus;
    await saveProfile(p);
    await store.addEvent({ kid: 'tay', type: 'chest', coins: bonus });
    b.innerHTML = ICON.chest(true);
    b.classList.add('opened');
    $(el, '.earned').textContent = coins + bonus;
    sfx('coin'); burst(el, 12);
    say(pick('chest_open'), `${bonus} 코인이야.`);
  });
  on(el, '.sticker-card', () => say(st.word));
  on(el, '[data-go]', (b) => app.go(b.dataset.go));
  on(el, '.again', () => runLesson(buildLesson(p, stage ? STAGE_BY_ID[stage].unit : undefined, stage)));
  await talk(null, pick('lesson_done'), bestCombo >= 3 ? pick('best_combo') : null, st ? pick('new_sticker') : null, st ? st.word : null, unlocked ? pick('unit_unlock') : null, pick('chest'));
};

// ---- sticker book --------------------------------------------------------------
screens.stickers = async (set = STICKER_SETS[0]) => {
  const p = app.profile || (app.profile = await loadProfile('tay'));
  const list = STICKERS.filter((s) => s.set === set);
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="지도로">${ICON.back()}</button>
      <h1 class="title" style="font-size:56px">스티커 책</h1>
      <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button>
      <div class="grow"></div>${coinPill(p.coins)}
    </div>
    <div class="tabs">${STICKER_SETS.map((s) => {
      const have = STICKERS.filter((x) => x.set === s && p.stickers.includes(x.id)).length;
      const total = STICKERS.filter((x) => x.set === s).length;
      return `<button class="tab ${s === set ? 'on' : ''}" data-set="${s}">${s} ${have}/${total}</button>`;
    }).join('')}</div>
    <div class="sgrid">${list.map((s) => p.stickers.includes(s.id)
      ? `<button class="scell" data-word="${esc(s.word)}" aria-label="${esc(s.word)}"><span class="pic">${s.svg()}</span><span class="w">${esc(s.word)}</span></button>`
      : `<div class="scell locked"><span class="pic">?</span></div>`).join('')}</div>
  </section>`));
  const speak = $(el, '.speak');
  talk(speak, pick('stickers'));
  on(el, '.speak', () => talk(speak, pick('stickers')));
  on(el, '.back', () => app.go('map'));
  on(el, '.tab', (b) => { sfx('pop'); say(b.dataset.set); app.go('stickers', b.dataset.set); });
  on(el, '.scell[data-word]', (b) => { sfx('pop'); say(b.dataset.word); });
};

// ---- 망고 옷 가게: tabs by body part, preview on 망고, buy, wear/take off ---------------
const SHOP_TABS = ['head', 'face', 'body', 'legs', 'feet', 'hands', 'back', 'dance', 'effect', 'pet'];
screens.shop = async ({ tab = 'head', selected = null } = {}) => {
  const p = app.profile || (app.profile = await loadProfile('tay'));
  const sel = selected ? SHOP_BY_ID[selected] : null;
  const preview = sel ? { ...p.equipped, [sel.slot]: sel.id } : p.equipped;
  const wearing = sel && p.equipped[sel.slot] === sel.id;
  const items = SHOP.filter((s) => s.slot === tab);
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="지도로">${ICON.back()}</button>
      <h1 class="title" style="font-size:52px">망고 옷 가게</h1>
      <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button>
      <div class="grow"></div>${coinPill(p.coins)}
    </div>
    <div class="tabs shop-tabs">${SHOP_TABS.map((t) => `<button class="tab ${t === tab ? 'on' : ''}" data-tab="${t}">${SLOT_NAMES[t]}</button>`).join('')}</div>
    <div class="shop">
      <div class="mirror panel"><button class="mango-btn" aria-label="망고 춤">${mango({ equipped: preview, size: 300, mood: sel && !p.owned.includes(sel.id) ? 'wow' : 'happy', dancing: !!(sel && sel.slot === 'dance') })}</button>
        ${sel && !p.owned.includes(sel.id) ? `<button class="buy">${ICON.star('#151B3D')} ${sel.price} 사기</button>` : ''}
        ${sel && p.owned.includes(sel.id) && wearing && sel.id !== 'helmet' ? `<button class="buy off" style="background:#C9D1F2">벗기</button>` : ''}
        ${sel && p.owned.includes(sel.id) && !wearing ? `<button class="buy wear" style="background:#5ED3C7">입기</button>` : ''}
      </div>
      <div class="igrid">${items.map((s) => `<button class="item ${p.equipped[s.slot] === s.id ? 'on' : ''} ${sel && sel.id === s.id ? 'sel' : ''}" data-id="${s.id}" aria-label="${esc(s.name)}">
        ${shopIcon(s.id)}
        ${p.owned.includes(s.id) ? `<span class="owned">${ICON.check('#4CC76B').replace('<svg', '<svg width="30" height="30"')}</span>` : `<span class="price">${ICON.star()} ${s.price}</span>`}
      </button>`).join('')}</div>
    </div>
  </section>`));
  const speak = $(el, '.speak');
  if (!selected && tab === 'head') talk(speak, pick('shop'));
  on(el, '.speak', () => talk(speak, pick('shop')));
  on(el, '.back', () => app.go('map'));
  bindDance(el);
  on(el, '.tab', (b) => { sfx('pop'); app.go('shop', { tab: b.dataset.tab }); say(SLOT_NAMES[b.dataset.tab]); });
  on(el, '.item', (b) => {
    sfx('pop');
    const it = SHOP_BY_ID[b.dataset.id];
    app.go('shop', { tab, selected: it.id });
    if (p.owned.includes(it.id)) say(it.name);
    else say(it.name, `${it.price} 코인이야.`);
  });
  on(el, '.buy:not(.off):not(.wear)', async () => {
    if (p.coins < sel.price) { sfx('bad'); talk(speak, pick('shop_need')); return; }
    p.coins -= sel.price;
    p.owned.push(sel.id);
    p.equipped[sel.slot] = sel.id;
    await saveProfile(p);
    await store.addEvent({ kid: 'tay', type: 'buy', item: sel.id, price: sel.price });
    sfx('coin');
    app.go('shop', { tab, selected: sel.id });
    burst(document.getElementById('app'), 14);
    say(pick('shop_bought'));
  });
  on(el, '.buy.wear', async () => { p.equipped[sel.slot] = sel.id; await saveProfile(p); app.go('shop', { tab, selected: sel.id }); say(pick('shop_wear')); });
  on(el, '.buy.off', async () => { delete p.equipped[sel.slot]; await saveProfile(p); app.go('shop', { tab, selected: sel.id }); });
};

// ---- boot --------------------------------------------------------------------
async function boot() {
  fitStage();
  drawSky();
  window.addEventListener('resize', fitStage);
  app.settings = await store.get('settings', { voice: 'playful' });
  setVoice(app.settings.voice);
  app.go('splash');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
boot();
