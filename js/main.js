import { app, html, mount, on, $, $$, talk, coinPill, burst, fitStage, drawSky, esc, wait } from './ui.js';
import { say, setVoice, sfx } from './audio.js';
import { pick } from './lines.js';
import { mango, ICON, STICKERS, STICKER_SETS, STICKER_BY_ID, SHOP, shopIcon } from './art.js';
import { UNITS } from './curriculum.js';
import { loadProfile, saveProfile, currentUnit, unitProgress, buildLesson } from './engine.js';
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
const POS = [[150, 430], [330, 300], [500, 420], [660, 280], [820, 400], [980, 270], [1120, 390], [960, 520], [760, 560]];

function starsFor(share) { return share >= 0.8 ? 3 : share >= 0.5 ? 2 : share >= 0.2 ? 1 : 0; }

screens.map = async ({ greet = false } = {}) => {
  const p = app.profile = await loadProfile('tay');
  const cur = currentUnit(p);
  const saved = await store.get('lesson:tay');
  let path = '';
  for (let i = 1; i < POS.length; i++) path += `<line x1="${POS[i - 1][0]}" y1="${POS[i - 1][1] - 100}" x2="${POS[i][0]}" y2="${POS[i][1] - 100}" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-dasharray="4 14" stroke-linecap="round"/>`;
  const planets = UNITS.map((u, i) => {
    const locked = !p.unlocked.includes(u.id);
    const prog = unitProgress(p, u);
    const size = u.id === cur.id ? 132 : 104;
    const st = starsFor(prog.share);
    const fs = u.icon.length > 1 ? 34 : 54;
    return `<button class="planet-btn ${locked ? 'locked' : ''} ${u.id === cur.id ? 'current' : ''}" data-unit="${u.id}" style="left:${POS[i][0]}px;top:${POS[i][1] - 100}px" aria-label="${esc(u.name)}">
      <span class="orb" style="width:${size}px;height:${size}px;background:${u.color};--glow:${u.color}99;font-size:${fs}px">${locked ? `<span style="width:40px;height:40px">${ICON.lock('#6B75A8')}</span>` : esc(u.icon)}</span>
      <span class="stars">${[0, 1, 2].map((k) => ICON.star(k < st ? '#FFD86B' : 'rgba(255,255,255,0.18)')).join('')}</span>
    </button>`;
  }).join('');
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="처음으로">${ICON.back()}</button>
      <div class="grow"></div>
      ${coinPill(p.coins)}
    </div>
    <div class="map">
      <svg class="map-path" width="1200" height="560" aria-hidden="true">${path}</svg>
      ${planets}
    </div>
    <div class="row">
      <div class="row" style="gap:6px">${mango({ equipped: p.equipped, size: 150 })}
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
  const intro = saved ? pick('welcome_back') : greet ? pick('hello') : pick('map_go');
  talk(speak, intro, greet && !saved ? pick('map_go') : null);
  on(el, '.speak', () => talk(speak, pick('map_go')));
  on(el, '.back', () => app.go('entry'));
  on(el, '[data-go]', (b) => app.go(b.dataset.go));
  on(el, '.go', async () => {
    sfx('pop');
    const lesson = saved || buildLesson(p, cur.id);
    runLesson(lesson);
  });
  on(el, '.planet-btn', (b) => {
    const u = UNITS.find((x) => x.id === b.dataset.unit);
    if (!p.unlocked.includes(u.id)) { sfx('bad'); talk(speak, pick('planet_locked')); return; }
    sfx('pop');
    runLesson(buildLesson(p, u.id));
  });
};

// ---- reward ------------------------------------------------------------------
screens.reward = async ({ accuracy, coins, sticker, unlocked }) => {
  const p = app.profile;
  const stars = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;
  const st = sticker ? STICKER_BY_ID[sticker] : null;
  const el = mount(html(`<section class="screen reward" style="gap:22px">
    <div class="stars-row">${[0, 1, 2].map((k) => `<span class="${k === 1 ? 'mid' : ''}">${ICON.star(k < stars ? '#FFD86B' : 'rgba(255,255,255,0.2)')}</span>`).join('')}</div>
    <h1 class="title" style="font-size:72px">잘했어, 태이야!</h1>
    <div class="coin-burst">${ICON.star()} +${coins}</div>
    ${st ? `<button class="panel sticker-card" aria-label="${esc(st.word)}"><span class="pic">${st.svg()}</span><span class="w">${esc(st.word)}</span></button>` : ''}
    ${unlocked ? `<div class="pill" style="font-size:34px">${ICON.rocket()} 새 행성: ${esc(UNITS.find((u) => u.id === unlocked).name)}</div>` : ''}
    <div class="row" style="gap:24px">
      ${st ? `<button class="big-btn" data-go="stickers">${ICON.book('#151B3D')} 스티커 책</button>` : ''}
      <button class="big-btn" data-go="map" style="background:#5ED3C7">${ICON.rocket()} 지도로</button>
    </div>
  </section>`));
  const s = el.querySelector('.stars-row');
  s.querySelectorAll('span').forEach((x) => { x.querySelector('svg').classList.toggle('mid', x.classList.contains('mid')); });
  burst(el, 16);
  await talk(null, pick('lesson_done'), st ? pick('new_sticker') : null, st ? st.word : null, unlocked ? pick('unit_unlock') : null);
  on(el, '.sticker-card', () => say(st.word));
  on(el, '[data-go]', (b) => app.go(b.dataset.go));
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

// ---- 망고 옷 가게 ----------------------------------------------------------------
screens.shop = async (selected = null) => {
  const p = app.profile || (app.profile = await loadProfile('tay'));
  const sel = selected ? SHOP.find((s) => s.id === selected) : null;
  const preview = sel ? { ...p.equipped, [sel.slot]: sel.id } : p.equipped;
  const el = mount(html(`<section class="screen">
    <div class="row">
      <button class="round back" aria-label="지도로">${ICON.back()}</button>
      <h1 class="title" style="font-size:56px">망고 옷 가게</h1>
      <button class="speak small" aria-label="다시 듣기">${ICON.speaker()}</button>
      <div class="grow"></div>${coinPill(p.coins)}
    </div>
    <div class="shop">
      <div class="mirror panel">${mango({ equipped: preview, size: 320, mood: sel && !p.owned.includes(sel.id) ? 'wow' : 'happy' })}
        ${sel && !p.owned.includes(sel.id) ? `<button class="buy">${ICON.star('#151B3D')} ${sel.price} 사기</button>` : ''}
        ${sel && p.owned.includes(sel.id) && Object.values(p.equipped).includes(sel.id) ? `<button class="buy off" style="background:#C9D1F2">벗기</button>` : ''}
      </div>
      <div class="igrid">${SHOP.map((s) => `<button class="item ${Object.values(p.equipped).includes(s.id) ? 'on' : ''}" data-id="${s.id}" aria-label="${esc(s.name)}">
        ${shopIcon(s.id)}
        ${p.owned.includes(s.id) ? `<span class="owned">${ICON.check('#4CC76B').replace('<svg', '<svg width="30" height="30"')}</span>` : `<span class="price">${ICON.star()} ${s.price}</span>`}
      </button>`).join('')}</div>
    </div>
  </section>`));
  const speak = $(el, '.speak');
  if (!selected) talk(speak, pick('shop'));
  on(el, '.speak', () => talk(speak, pick('shop')));
  on(el, '.back', () => app.go('map'));
  on(el, '.item', async (b) => {
    sfx('pop');
    const it = SHOP.find((s) => s.id === b.dataset.id);
    if (p.owned.includes(it.id)) {
      p.equipped[it.slot] = it.id;
      await saveProfile(p);
      app.go('shop', it.id);
      say(pick('shop_wear'));
    } else {
      app.go('shop', it.id);
      say(it.name, `${it.price} 코인이야.`);
    }
  });
  on(el, '.buy:not(.off)', async () => {
    if (p.coins < sel.price) { sfx('bad'); talk(speak, pick('shop_need')); return; }
    p.coins -= sel.price;
    p.owned.push(sel.id);
    p.equipped[sel.slot] = sel.id;
    await saveProfile(p);
    await store.addEvent({ kid: 'tay', type: 'buy', item: sel.id, price: sel.price });
    sfx('coin');
    app.go('shop', sel.id);
    burst(document.getElementById('app'), 14);
    say(pick('shop_bought'));
  });
  on(el, '.buy.off', async () => {
    delete p.equipped[sel.slot];
    await saveProfile(p);
    app.go('shop', sel.id);
  });
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
