// 어른용 › 태오 · 수학: placement check results, export for curriculum planning.
import { app, html, mount, on, toast, esc } from './ui.js';
import { PARTS, TOPICS, loadPlacement, resetPlacement, placementReport, rating, isRight } from './placement.js';
import { download, today } from './report.js';
import { grownups } from './grownups.js';

const HOW = { head: '암산', paper: '종이', picture: '그림', guess: '추측' };
const fmt = (q, a) => {
  if (!a) return '';
  if (a.skipped) return '건너뜀 (앞 문제 2개 틀림)';
  if (a.dontKnow) return '모르겠어요';
  if (a.timeout) return '시간 초과';
  if (q.type === 'facts') return `${a.correct}/10 · 평균 ${(a.ms / 10000).toFixed(1)}초`;
  if (q.type === 'choice') return q.options[a.value];
  if (q.type === 'multi') return a.value.join(', ');
  const v = (+a.value).toLocaleString('en');
  return a.rechecked ? `${(+a.first).toLocaleString('en')} → ${v}` : v;
};
const correctText = (q) => (q.type === 'choice' ? q.options[q.answer] : q.type === 'multi' ? q.answer.join(', ') : q.type === 'line' ? `${q.ok[0]}–${q.ok[1]}` : q.type === 'facts' ? '8/10 이상' : (+q.answer).toLocaleString('en'));

export async function theoAdult() {
  const s = await loadPlacement();
  const { rows, sense } = placementReport(s);
  const answered = PARTS.reduce((n, p, i) => n + Object.keys(s.parts[i].answers).length, 0);
  const total = PARTS.reduce((n, p) => n + p.questions.length, 0);
  const tag = (r) => `<span class="rt rt-${{ '탄탄': 'good', '연습 필요': 'mid', '아직': 'low' }[r] || 'none'}">${r}</span>`;
  const el = mount(html(`<section class="screen adult">
    <div style="display:flex;align-items:center;gap:14px"><h1>어른용</h1><div style="flex:1"></div><button class="b close">닫기</button></div>
    <div class="seg"><button class="tay">태이 · 한글</button><button class="on">태오 · 수학</button></div>
    <div class="cards">
      <div class="card"><span>배치 평가 진행</span><b>${answered} / ${total}</b></div>
      <div class="card"><span>1부</span><b>${s.parts[0].done ? '완료' : '진행 중'}</b></div>
      <div class="card"><span>2부</span><b>${s.parts[1].done ? '완료' : s.parts[0].done ? '진행 중' : '1부 후'}</b></div>
    </div>
    <div class="cols">
      <div class="box"><h2>영역별 결과 (개념 · 계산)</h2>
        ${Object.keys(rows).length ? `<table><tr><th>영역</th><th>개념</th><th>계산</th></tr>${Object.entries(TOPICS).filter(([k]) => rows[k]).map(([k, name]) => { const r = rows[k]; return `<tr><td>${esc(name)}</td><td>${tag(rating(r.concept))} <small class="muted">${r.concept[0]}/${r.concept[1]}</small></td><td>${tag(rating(r.skill))} <small class="muted">${r.skill[0]}/${r.skill[1]}</small></td></tr>`; }).join('')}</table>
        <p class="muted">탄탄 80% 이상 · 연습 필요 50–79% · 아직 50% 미만</p>` : '<p class="muted">아직 푼 문제가 없어요.</p>'}
      </div>
      <div class="box"><h2>자기 답 점검 (수 감각)</h2>
        ${sense.selfcheck.length ? `<table><tr><th>문제</th><th>결과</th></tr>${sense.selfcheck.map((c) => `<tr><td>${esc(c.q)}</td><td>${esc(c.result)}</td></tr>`).join('')}</table>
        <p class="muted">"wrong → trusted it" 은 틀린 답을 맞다고 믿은 경우예요. 답의 크기를 가늠하는 연습이 필요하다는 신호예요.</p>` : '<p class="muted">큰 수 곱셈 문제 후에 나와요.</p>'}
      </div>
    </div>
    ${PARTS.map((p, pi) => `<div class="box"><h2>${esc(p.title)}</h2><table><tr><th>#</th><th>문제</th><th>정답</th><th>태오 답</th><th></th></tr>
      ${p.questions.map((q, k) => { const a = s.parts[pi].answers[q.id]; return `<tr><td>${k + 1}</td><td>${esc(q.q)}</td><td>${esc(correctText(q))}</td><td>${esc(fmt(q, a))}${a && a.how ? ` <small class="muted">(${HOW[a.how]})</small>` : ''}${a && a.ms && q.type !== 'facts' ? ` <small class="muted">${Math.round(a.ms / 1000)}초</small>` : ''}</td><td>${a ? (isRight(q, a) ? '✅' : '❌') : ''}</td></tr>`; }).join('')}</table></div>`).join('')}
    <div class="box"><h2>내보내기 · 다시 하기</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="b primary export">결과 파일 내보내기</button><button class="b reset">배치 평가 처음부터</button></div>
      <p class="muted">결과 파일을 Claude에게 보내 주면 태오의 수학 단원을 만들어요.</p>
    </div>
  </section>`));
  on(el, '.close', () => app.go('entry'));
  on(el, '.tay', () => grownups());
  on(el, '.export', () => {
    const detail = PARTS.map((p, pi) => p.questions.map((q) => ({ id: q.id, topic: q.topic, kind: q.kind, question: q.q, correct: correctText(q), answer: s.parts[pi].answers[q.id] || null, right: isRight(q, s.parts[pi].answers[q.id]) })));
    download(`theo-placement-${today()}.json`, { kid: 'theo', type: 'math-placement', exported: new Date().toISOString(), summary: Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, { concept: r.concept, skill: r.skill, skipped: r.skipped }])), selfcheck: sense.selfcheck, detail });
    toast('결과 파일을 저장했어요.');
  });
  on(el, '.reset', async () => {
    if (!confirm('태오의 배치 평가 기록을 지우고 처음부터 할까요?')) return;
    await resetPlacement();
    toast('처음부터 다시 할 수 있어요.');
    theoAdult();
  });
}
