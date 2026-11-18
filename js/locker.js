// 태오's coins, Ballon's outfit, and Ballon's Locker (the shop). English UI.
import { app, html, mount, on, $, $$, esc, toast, burst } from './ui.js';
import { sfx } from './audio.js';
import { store } from './store.js';
import { ballon, celebrate, SHOP, SHOP_BY_ID, TABS, DEFAULT_EQUIPPED, CEL_ICON, KITS } from './ballon.js';

const KEY = 'theo:profile';
const FREE = SHOP.filter((s) => s.price === 0).map((s) => s.id);

export async function loadTheo() {
  const p = (await store.get(KEY)) || { coins: 100, owned: [...FREE], equipped: { ...DEFAULT_EQUIPPED } };
  for (const id of FREE) if (!p.owned.includes(id)) p.owned.push(id);
  return p;
}
export const saveTheo = (p) => store.set(KEY, p);
export async function addCoins(n) {
  const p = await loadTheo();
  p.coins += n;
  await saveTheo(p);
  return p.coins;
}
// click delegation for parts of the screen that get re-rendered
const del = (el, sel, fn) => el.addEventListener('click', (e) => { const n = e.target.closest(sel); if (n && el.contains(n)) { e.preventDefault(); fn(n, e); } });
export const coinChip = (n) => `<span class="tcoin">⚽ <b>${n}</b></span>`;

// Ballon's Locker
export async function locker(back) {
  const p = await loadTheo();
  let tab = 'kit';
  let trying = null; // item being previewed
  const el = mount(html(`<section class="screen locker">
    <div class="row"><button class="round back" aria-label="Back">←</button>
      <h1 class="title" style="font-size:56px;margin:0 auto">Ballon's Locker</h1><span class="coinslot">${coinChip(p.coins)}</span></div>
    <div class="lk-main">
      <div class="lk-stage"><div class="lk-pitch"></div><div class="lk-ballon"></div>
        <button class="big-btn lk-cel">Celebrate!</button></div>
      <div class="lk-shop">
        <div class="lk-tabs">${TABS.map(([k, t]) => `<button data-tab="${k}">${t}</button>`).join('')}</div>
        <div class="lk-grid"></div>
        <div class="lk-act"></div>
      </div>
    </div></section>`));
  const preview = () => {
    const eq = { ...p.equipped };
    if (trying && trying.slot !== 'celebrate') eq[trying.slot] = trying.id;
    $(el, '.lk-ballon').innerHTML = ballon({ equipped: eq, size: 300 });
  };
  const coinsUi = () => { $(el, '.coinslot').innerHTML = coinChip(p.coins); };
  const card = (it) => {
    const owned = p.owned.includes(it.id), worn = p.equipped[it.slot] === it.id;
    let pic;
    if (it.slot === 'celebrate') pic = `<span class="lk-emoji">${CEL_ICON[it.cel]}</span>`;
    else pic = ballon({ equipped: { ...DEFAULT_EQUIPPED, [it.slot]: it.id }, size: 96, cls: `mini mini-${it.slot}` });
    return `<button class="lk-card ${worn ? 'worn' : ''} ${trying && trying.id === it.id ? 'sel' : ''}" data-id="${it.id}">
      <span class="lk-pic">${pic}</span><span class="lk-name">${esc(it.name)}</span>
      ${it.sub ? `<span class="lk-sub">${esc(it.sub)}</span>` : ''}
      <span class="lk-price">${worn ? 'Wearing' : owned ? 'Owned' : `⚽ ${it.price}`}</span></button>`;
  };
  const grid = () => {
    $$(el, '.lk-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    $(el, '.lk-grid').innerHTML = SHOP.filter((s) => s.slot === tab).map(card).join('');
    actions();
  };
  const actions = () => {
    const box = $(el, '.lk-act');
    if (!trying) { box.innerHTML = '<p class="lk-hint">Tap an item to try it on!</p>'; return; }
    const owned = p.owned.includes(trying.id), worn = p.equipped[trying.slot] === trying.id;
    const removable = !['kit', 'hair', 'boots', 'ball', 'celebrate'].includes(trying.slot);
    box.innerHTML = `<span class="lk-sel">${esc(trying.name)}${trying.sub ? ` · ${esc(trying.sub)}` : ''}</span>
      ${owned ? (worn ? (removable ? '<button class="big-btn alt lk-off">Take off</button>' : '<span class="lk-hint">Wearing it!</span>') : '<button class="big-btn lk-wear">Wear it</button>')
        : `<button class="big-btn lk-buy" ${p.coins < trying.price ? 'disabled' : ''}>Buy · ⚽ ${trying.price}</button>${p.coins < trying.price ? `<span class="lk-hint">Need ${trying.price - p.coins} more</span>` : ''}`}`;
  };
  on(el, '.back', () => (back ? back() : app.go('entry')));
  on(el, '.lk-tabs button', (b) => { sfx('pop'); tab = b.dataset.tab; trying = null; preview(); grid(); });
  del(el, '.lk-card', (b) => {
    sfx('pop');
    trying = SHOP_BY_ID[b.dataset.id];
    preview();
    grid();
    if (trying.slot === 'celebrate') celebrate($(el, '.lk-ballon .ballon'), trying.cel);
  });
  del(el, '.lk-buy', async () => {
    if (p.coins < trying.price) return;
    p.coins -= trying.price;
    p.owned.push(trying.id);
    p.equipped[trying.slot] = trying.id;
    await saveTheo(p);
    sfx('coin');
    burst($(el, '.lk-stage'), 18);
    toast(`You got ${trying.name}!`);
    coinsUi(); preview(); grid();
    celebrate($(el, '.lk-ballon .ballon'), SHOP_BY_ID[p.equipped.celebrate].cel);
  });
  del(el, '.lk-wear', async () => { p.equipped[trying.slot] = trying.id; await saveTheo(p); sfx('ok'); preview(); grid(); });
  del(el, '.lk-off', async () => { delete p.equipped[trying.slot]; await saveTheo(p); sfx('pop'); trying = null; preview(); grid(); });
  on(el, '.lk-cel', () => {
    const cel = trying && trying.slot === 'celebrate' ? trying.cel : SHOP_BY_ID[p.equipped.celebrate].cel;
    celebrate($(el, '.lk-ballon .ballon'), cel);
  });
  on(el, '.lk-ballon', () => celebrate($(el, '.lk-ballon .ballon'), SHOP_BY_ID[p.equipped.celebrate].cel));
  preview();
  grid();
}
export { KITS };
