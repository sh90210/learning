// Hangul composition helpers.
export const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
export const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

export function compose(c, v, t = '') {
  const l = CHO.indexOf(c), m = JUNG.indexOf(v), f = JONG.indexOf(t);
  if (l < 0 || m < 0 || f < 0) return null;
  return String.fromCharCode(0xAC00 + (l * 21 + m) * 28 + f);
}

export function decompose(ch) {
  const code = ch.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  return { c: CHO[Math.floor(code / 588)], v: JUNG[Math.floor((code % 588) / 28)], t: JONG[code % 28] };
}

export function isHangulSyllable(ch) {
  const c = ch.charCodeAt(0);
  return c >= 0xAC00 && c <= 0xD7A3;
}

// The sound a child hears for a single letter: consonant + ㅡ, or ㅇ + vowel.
export function letterSound(j) {
  if (CHO.includes(j)) return compose(j, 'ㅡ');
  if (JUNG.includes(j)) return compose('ㅇ', j);
  return j;
}

// Rough similarity between two syllables (0..1), used to be kind about mic results.
const SIMILAR = [['ㄱ','ㅋ','ㄲ'],['ㄷ','ㅌ','ㄸ'],['ㅂ','ㅍ','ㅃ'],['ㅈ','ㅊ','ㅉ'],['ㅅ','ㅆ'],['ㄴ','ㄹ'],['ㅓ','ㅗ'],['ㅐ','ㅔ'],['ㅜ','ㅡ']];
function near(a, b) { return a === b || SIMILAR.some((g) => g.includes(a) && g.includes(b)); }
export function syllableSimilarity(a, b) {
  const x = decompose(a), y = decompose(b);
  if (!x || !y) return a === b ? 1 : 0;
  let s = 0;
  s += x.c === y.c ? 0.4 : near(x.c, y.c) ? 0.25 : 0;
  s += x.v === y.v ? 0.45 : near(x.v, y.v) ? 0.25 : 0;
  s += x.t === y.t ? 0.15 : 0;
  return s;
}
