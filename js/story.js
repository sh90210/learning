// 태이's picture stories: Sena reads each page, then he taps words to hear them.
import { app, html, mount, on, $, $$, esc, talk, burst, coinPill } from './ui.js';
import { say, sfx, stop } from './audio.js';
import { pick } from './lines.js';
import { STORY_BY_ID, picUrl } from './curriculum.js';
import { loadProfile, saveProfile } from './engine.js';
import { ICON } from './art.js';

const STORY_COINS = 30;
const clean = (t) => t.replace(/[.!?,]/g, '');

export async function storyScreen(id) {
  const story = STORY_BY_ID[id];
  const p = app.profile = await loadProfile('tay');
  let page = 0;
  const heard = new Set(); // pages whose words he tapped at least once

  const render = () => {
    const pg = story.pages[page];
    const words = pg.text.split(' ');
    const many = pg.pics.length > 2;
    const el = mount(html(`<section class="screen story">
      <div class="row">
        <button class="round back" aria-label="지도로">${ICON.back()}</button>
        <h1 class="st-title">${esc(story.name)}</h1>
        <div class="grow"></div>
        <span class="st-page">${page + 1} / ${story.pages.length}</span>
      </div>
      <div class="st-book">
        <div class="st-pics ${many ? 'many' : ''}">${pg.pics.map((k) => `<button class="st-pic" data-k="${k}"><img class="wpic" src="${picUrl(k)}" alt=""></button>`).join('')}</div>
        <div class="st-line">${words.map((w, i) => `<button class="st-word" data-i="${i}" data-w="${esc(clean(w))}">${esc(w)}</button>`).join('')}</div>
      </div>
      <div class="row st-nav">
        <button class="round st-prev" aria-label="앞 장" ${page === 0 ? 'disabled' : ''}>${ICON.prev()}</button>
        <button class="speak" aria-label="다시 읽어 줘">${ICON.speaker()}</button>
        <div class="grow"></div>
        <button class="big-btn st-next">${page === story.pages.length - 1 ? '다 읽었어!' : '다음 장'} ${page === story.pages.length - 1 ? '' : ICON.next('#151B3D')}</button>
      </div>
    </section>`));
    const speak = $(el, '.speak');
    const wordEls = $$(el, '.st-word');
    const readPage = async (intro) => {
      wordEls.forEach((w) => w.classList.add('lit'));
      await talk(speak, intro ? pick('story_intro') : null, pg.text);
      wordEls.forEach((w) => w.classList.remove('lit'));
      if (page === 0 && intro) talk(speak, pick('story_tap'));
    };
    readPage(page === 0);
    on(el, '.back', () => { stop(); app.go('map'); });
    on(el, '.speak', () => readPage(false));
    on(el, '.st-word', (b) => {
      stop();
      sfx('pop');
      wordEls.forEach((w) => w.classList.remove('lit'));
      b.classList.add('lit', 'heard');
      heard.add(page);
      say(b.dataset.w);
    });
    on(el, '.st-pic', (b) => { stop(); say({ sfx: b.dataset.k }); });
    on(el, '.st-prev', () => { if (page > 0) { stop(); page--; render(); } });
    on(el, '.st-next', () => {
      stop();
      sfx('ok');
      if (page < story.pages.length - 1) { page++; render(); } else finish();
    });
  };

  async function finish() {
    const first = !(p.stories && p.stories[id]);
    p.stories = { ...(p.stories || {}), [id]: true };
    const coins = first ? STORY_COINS : 10;
    p.coins += coins;
    await saveProfile(p);
    const el = mount(html(`<section class="screen story center-col">
      <h1 class="title" style="font-size:84px">이야기 끝! 📖</h1>
      <div class="st-pics many">${[...new Set(story.pages.flatMap((pg) => pg.pics))].map((k) => `<span class="st-pic"><img class="wpic" src="${picUrl(k)}" alt=""></span>`).join('')}</div>
      <div class="row center" style="gap:16px">${coinPill(p.coins)}<span class="st-plus">+${coins}</span></div>
      <div class="row center" style="gap:20px"><button class="big-btn alt again">한 번 더 읽기</button><button class="big-btn done">지도로 가자!</button></div>
    </section>`));
    sfx('star');
    burst($(el, '.title'), 26);
    talk(null, pick('story_end'));
    on(el, '.again', () => { stop(); page = 0; render(); });
    on(el, '.done', () => { stop(); app.go('map'); });
  }

  render();
}
