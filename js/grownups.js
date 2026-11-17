// 어른용: progress, recordings, voice setting, report export, backup.
import { app, html, mount, on, $, toast, esc } from './ui.js';
import { setVoice, say, VOICES, hasClip } from './audio.js';
import { UNITS, ITEM_BY_ID } from './curriculum.js';
import { loadProfile, unitProgress, currentUnit, newProfile, saveProfile } from './engine.js';
import { store } from './store.js';
import { buildReport, download, today, backup, restore, lessonMinutes } from './report.js';

function color(score) { return score >= 70 ? '#4CC76B' : score >= 40 ? '#FFB020' : score > 0 ? '#FF7A6B' : '#E3E8F5'; }

export async function grownups(tab = 'tay') {
  const p = await loadProfile('tay');
  const events = (await store.allEvents()).filter((e) => e.kid === 'tay');
  const week = Date.now() - 7 * 86400000;
  const recent = events.filter((e) => e.type === 'answer' && e.activity !== 'intro' && e.t >= week);
  const acc = recent.length ? Math.round((recent.filter((e) => e.correct).length / recent.length) * 100) : null;
  const mins = lessonMinutes(events.filter((e) => e.t >= week)).total;
  const unlockedItems = UNITS.filter((u) => p.unlocked.includes(u.id)).flatMap((u) => u.items);
  const mastered = unlockedItems.filter((it) => (p.mastery[it.id]?.score || 0) >= 70).length;
  const conf = [];
  for (const [t, m] of Object.entries(p.confusions)) for (const [c, n] of Object.entries(m)) if (n >= 1) conf.push([ITEM_BY_ID[t]?.text, ITEM_BY_ID[c]?.text, n]);
  conf.sort((a, b) => b[2] - a[2]);
  const recs = (await store.allRecordings()).filter((r) => r.kid === 'tay').slice(-24).reverse();
  const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false;
  const voice = app.settings.voice;
  const clipsReady = {};
  for (const v of Object.keys(VOICES)) clipsReady[v] = await hasClip('태이!', v);
  const cur = currentUnit(p);

  const el = mount(html(`<section class="screen adult">
    <div style="display:flex;align-items:center;gap:14px">
      <h1>어른용</h1><div style="flex:1"></div>
      <button class="b close">닫기</button>
    </div>
    <div class="seg"><button class="on">태이 · 한글</button><button class="theo">태오 · 수학 (준비 중)</button></div>

    <div class="cards">
      <div class="card"><span>익힌 글자 (열린 행성)</span><b>${mastered} / ${unlockedItems.length}</b></div>
      <div class="card"><span>정답률 · 최근 7일</span><b>${acc === null ? '–' : acc + '%'}</b></div>
      <div class="card"><span>공부 시간 · 최근 7일</span><b>${Math.round(mins)}분</b></div>
      <div class="card"><span>연속 공부 · 수업 수</span><b>${p.streakDays}일 · ${p.lessonsDone}번</b></div>
    </div>

    <div class="cols">
      <div class="box"><h2>행성(단원) 진행</h2>
        ${UNITS.map((u) => { const pr = unitProgress(p, u); return `<div style="display:flex;align-items:center;gap:10px;margin:6px 0">
          <span style="width:140px;font-size:15px">${esc(u.name)}${u.id === cur.id ? ' ★' : ''}</span>
          <div class="bar" style="flex:1"><i style="width:${Math.round(pr.share * 100)}%;background:${p.unlocked.includes(u.id) ? '#4CC76B' : '#C9D3EA'}"></i></div>
          <span class="muted" style="width:60px;text-align:right">${pr.done}/${pr.n}</span></div>`; }).join('')}
        <p class="muted">다음 행성은 지금 행성의 80%를 익히면 열려요.</p>
      </div>
      <div class="box"><h2>헷갈리는 글자</h2>
        ${conf.length ? `<table><tr><th>정답</th><th>고른 것</th><th>횟수</th></tr>${conf.slice(0, 8).map(([a, b, n]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td>${n}</td></tr>`).join('')}</table>
          <p class="muted">3번 이상 헷갈리면 수업에 비교 연습이 자동으로 들어가요.</p>` : '<p class="muted">아직 없어요.</p>'}
      </div>
    </div>

    <div class="box"><h2>글자별 실력 (${esc(cur.name)})</h2>
      <div class="mastery">${cur.items.map((it) => { const s = p.mastery[it.id]?.score || 0; return `<span title="${Math.round(s)}" style="background:${color(s)};${it.kind !== 'syl' ? 'width:auto;padding:0 10px;font-size:16px' : ''}">${esc(it.text)}</span>`; }).join('')}</div>
      <p class="muted">초록 = 익힘 · 노랑 = 연습 중 · 빨강 = 어려워함 · 회색 = 아직 안 배움</p>
    </div>

    <div class="cols">
      <div class="box"><h2>목소리</h2>
        <div class="seg voice">${Object.entries(VOICES).map(([k, v]) => `<button data-v="${k}" class="${k === voice ? 'on' : ''}">${v.label}${clipsReady[k] ? '' : ' (기본 음성)'}</button>`).join('')}</div>
        <p class="muted">녹음된 목소리가 없으면 태블릿의 한국어 음성으로 읽어요.</p>
        <button class="b test">들어 보기</button>
      </div>
      <div class="box"><h2>진도 리포트 · 백업</h2>
        <div style="display:flex;flex-wrap:wrap;gap:10px">
          <button class="a report">진도 리포트 내보내기</button>
          <button class="b save">백업 파일 저장</button>
          <label class="b" style="font-size:18px;font-weight:700;padding:12px 18px;border-radius:12px;border:2px solid #1B2340;cursor:pointer">백업 불러오기<input class="load" type="file" accept="application/json" hidden></label>
        </div>
        <p class="muted">리포트 파일을 Claude에게 주면 커리큘럼을 개선할 수 있어요. 저장 공간 보호: ${persisted ? '켜짐' : '꺼짐 (태블릿이 공간이 부족하면 지울 수 있어요)'}.</p>
        <button class="b reset" style="margin-top:6px">태이 진도 초기화</button>
      </div>
    </div>

    <div class="box"><h2>태이의 읽기 녹음</h2>
      ${recs.length ? `<table><tr><th>글자</th><th>마이크가 들은 것</th><th>결과</th><th></th></tr>${recs.map((r) => `<tr><td>${esc(r.text)}</td><td>${esc(r.heard || '–')}</td><td>${{ good: '잘 읽음', close: '거의', miss: '다름', none: '못 들음' }[r.verdict] || ''}</td><td><button class="b play" data-k="${r.key}" style="padding:6px 12px">듣기</button></td></tr>`).join('')}</table>` : '<p class="muted">아직 녹음이 없어요.</p>'}
    </div>
  </section>`));

  on(el, '.close', () => app.go('entry'));
  on(el, '.theo', () => toast('태오의 수학은 다음 업데이트에서 만들어요.'));
  on(el, '.voice button', async (b) => {
    app.settings.voice = b.dataset.v;
    setVoice(b.dataset.v);
    await store.set('settings', app.settings);
    grownups();
  });
  on(el, '.test', () => say('안녕, 태이야! 나는 망고야!'));
  on(el, '.report', async () => { download(`태이-진도리포트-${today()}.json`, await buildReport('tay')); toast('리포트를 다운로드했어요.'); });
  on(el, '.save', async () => { download(`태오랑태이랑-백업-${today()}.json`, await backup()); toast('백업 파일을 저장했어요.'); });
  $(el, '.load').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { await restore(f); toast('백업을 불러왔어요.'); grownups(); } catch (err) { toast(`불러오지 못했어요: ${err.message}`); }
  });
  let armed = false;
  on(el, '.reset', async (b) => {
    if (!armed) { armed = true; b.textContent = '정말 초기화할까요? 한 번 더 누르세요'; b.style.borderColor = '#E5383B'; b.style.color = '#E5383B'; return; }
    await saveProfile(newProfile('tay'));
    await store.del('lesson:tay');
    toast('초기화했어요.');
    grownups();
  });
  const recByKey = Object.fromEntries(recs.map((r) => [String(r.key), r]));
  on(el, '.play', (b) => {
    const r = recByKey[b.dataset.k];
    if (!r || !r.blob) return;
    const a = new Audio(URL.createObjectURL(r.blob));
    a.play();
  });
}
