// Finger tracing over a faint letter. The check is forgiving: enough of the
// letter covered, and not too much scribbling outside it.
const W = 560, H = 420;

export function traceActivity(wrap, text, { erase, check, onResult }) {
  const guide = document.createElement('canvas');
  const ink = document.createElement('canvas');
  for (const c of [guide, ink]) { c.width = W; c.height = H; wrap.appendChild(c); }
  const g = guide.getContext('2d');
  const k = ink.getContext('2d');
  const fontPx = text.length === 1 ? 330 : 200;
  const font = `${fontPx}px Jua, 'Do Hyeon', sans-serif`;

  function drawGuide() {
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    g.fillRect(0, 0, W, H);
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(201,209,242,0.35)';
    g.fillText(text, W / 2, H / 2 + 10);
    g.setLineDash([10, 12]); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.strokeText(text, W / 2, H / 2 + 10);
    g.setLineDash([]);
  }
  // fonts can arrive late; redraw when ready
  drawGuide();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawGuide);

  let drawing = false, last = null, tries = 0, busy = false;
  const pt = (e) => {
    const r = ink.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  k.lineCap = 'round'; k.lineJoin = 'round';
  ink.addEventListener('pointerdown', (e) => { if (busy) return; drawing = true; last = pt(e); ink.setPointerCapture(e.pointerId); dot(last); });
  ink.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pt(e);
    k.strokeStyle = '#FFD86B'; k.lineWidth = 30;
    k.beginPath(); k.moveTo(last[0], last[1]); k.lineTo(p[0], p[1]); k.stroke();
    last = p;
  });
  const end = () => { drawing = false; };
  ink.addEventListener('pointerup', end); ink.addEventListener('pointercancel', end);
  function dot(p) { k.fillStyle = '#FFD86B'; k.beginPath(); k.arc(p[0], p[1], 15, 0, Math.PI * 2); k.fill(); }

  erase.addEventListener('click', () => { k.clearRect(0, 0, W, H); });
  check.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    tries++;
    const res = score();
    const finished = await onResult({ ok: res.coverage >= 0.5 && res.outside <= 0.45, tries, ...res });
    if (!finished) k.clearRect(0, 0, W, H);
    busy = false;
  });

  function score() {
    // letter mask, and a thicker version as the "allowed" area
    const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
    const mk = mask.getContext('2d');
    mk.font = font; mk.textAlign = 'center'; mk.textBaseline = 'middle';
    mk.fillStyle = '#000'; mk.fillText(text, W / 2, H / 2 + 10);
    const letter = mk.getImageData(0, 0, W, H).data;
    mk.lineWidth = 46; mk.strokeStyle = '#000'; mk.lineJoin = 'round'; mk.strokeText(text, W / 2, H / 2 + 10);
    const allowed = mk.getImageData(0, 0, W, H).data;
    const user = k.getImageData(0, 0, W, H).data;
    let letterPx = 0, covered = 0, userPx = 0, outside = 0;
    for (let y = 0; y < H; y += 4) {
      for (let x = 0; x < W; x += 4) {
        const i = (y * W + x) * 4 + 3;
        const inLetter = letter[i] > 100, inAllowed = allowed[i] > 100, inUser = user[i] > 100;
        if (inLetter) { letterPx++; if (inUser) covered++; }
        if (inUser) { userPx++; if (!inAllowed) outside++; }
      }
    }
    return { coverage: letterPx ? +(covered / letterPx).toFixed(2) : 0, outside: userPx ? +(outside / userPx).toFixed(2) : 1 };
  }
}
