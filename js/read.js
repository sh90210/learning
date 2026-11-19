// Read aloud: Chrome's Korean speech recognition (needs internet) plus a
// recording kept on the tablet so a grown-up can listen later.
import { syllableSimilarity } from './hangul.js';
import { store } from './store.js';
import { stop } from './audio.js';

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function clean(s) { return (s || '').replace(/[^가-힣]/g, ''); }

export function judge(target, alternatives) {
  const t = clean(target);
  let best = 0;
  for (const alt of alternatives) {
    const a = clean(alt);
    if (!a) continue;
    if (a.includes(t)) return { verdict: 'good', heard: alt };
    if (t.length === 1) {
      for (const ch of a) best = Math.max(best, syllableSimilarity(t, ch));
    } else {
      // words: share of target syllables heard in place
      let hit = 0;
      [...t].forEach((ch, i) => { if (a[i] === ch || a.includes(ch)) hit++; });
      best = Math.max(best, hit / t.length);
    }
  }
  const heard = alternatives[0] || '';
  if (best >= 0.8) return { verdict: 'good', heard };
  if (best >= 0.5) return { verdict: 'close', heard };
  return { verdict: heard ? 'miss' : 'none', heard };
}

export function readActivity(btn, item, { onListening, onResult }) {
  let tries = 0, busy = false;
  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    stop();
    tries++;
    btn.classList.add('on');
    onListening && onListening();
    await new Promise((r) => setTimeout(r, 900)); // let "듣고 있어" finish first
    const [asr, blob] = await Promise.all([recognize(), record(item.kind === 'sentence' ? 4500 : 3500)]);
    btn.classList.remove('on');
    let r = asr.ok ? judge(item.text, asr.alts) : { verdict: 'none', heard: '' };
    // no speech recognition on this tablet (or it heard nothing): play her voice back
    // instead, then 망고 reads it. Nothing is marked wrong.
    if (r.verdict === 'none') r = { verdict: 'echo', heard: '' };
    if (blob) store.addRecording({ kid: 'tay', item: item.id, text: item.text, heard: r.heard, verdict: r.verdict, blob }).catch(() => {});
    const finished = await onResult({ ...r, tries, asr: asr.ok, asrError: asr.error || null, blob });
    busy = false;
    if (finished) btn.disabled = true;
  });
}

function recognize() {
  return new Promise((resolve) => {
    if (!SR) return resolve({ ok: false, alts: [], error: 'unsupported' });
    const rec = new SR();
    rec.lang = 'ko-KR';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let alts = [], settled = false, error = null;
    const finish = (ok) => { if (settled) return; settled = true; try { rec.stop(); } catch (e) { /* ignore */ } resolve({ ok, alts, error }); };
    rec.onresult = (e) => {
      for (const res of e.results) for (const a of res) alts.push(a.transcript);
      finish(true);
    };
    rec.onerror = (e) => { error = e.error || 'error'; finish(e.error === 'no-speech'); };
    rec.onend = () => finish(true);
    try { rec.start(); } catch (e) { error = 'start:' + (e.name || e.message); finish(false); }
    setTimeout(() => finish(alts.length > 0), 5000);
  });
}

async function record(ms) {
  try {
    if (!navigator.mediaDevices || !window.MediaRecorder) return null;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise((r) => { mr.onstop = r; });
    mr.start();
    await new Promise((r) => setTimeout(r, ms));
    mr.stop();
    await done;
    stream.getTracks().forEach((t) => t.stop());
    return chunks.length ? new Blob(chunks, { type: mr.mimeType || 'audio/webm' }) : null;
  } catch (e) {
    return null;
  }
}

// play a recording back; resolves when it ends (or after a safety timeout)
export function playBlob(blob) {
  return new Promise((resolve) => {
    if (!blob) return resolve();
    const url = URL.createObjectURL(blob);
    const a = new Audio(url);
    const end = () => { URL.revokeObjectURL(url); resolve(); };
    a.onended = end; a.onerror = end;
    a.play().catch(end);
    setTimeout(end, 6000);
  });
}
