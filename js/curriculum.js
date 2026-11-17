// 태이's Korean curriculum. Units are data: add new ones at the end and the
// engine picks them up. Each unit becomes a planet on the map.
import { compose } from './hangul.js';

const BASIC_V = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ'];

function grid(cons, vows) {
  const out = [];
  for (const c of cons) for (const v of vows) out.push({ text: compose(c, v), kind: 'syl', parts: [c, v] });
  return out;
}
function syls(list) {
  // list of [syllable, c, v, t?]
  return list.map(([text, c, v, t]) => ({ text, kind: 'syl', parts: t ? [c, v, t] : [c, v] }));
}
function words(list, kind = 'word') {
  return list.map((text) => ({ text, kind }));
}

export const UNITS = [
  { id: 'u1', name: '가나다 행성', icon: '가', color: '#FF8A3D', items: grid(['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ'], BASIC_V) },
  { id: 'u2', name: '라바사 행성', icon: '라', color: '#5ED3C7', items: grid(['ㄹ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ'], BASIC_V) },
  { id: 'u3', name: '하카타 행성', icon: '하', color: '#FF9AC4', items: grid(['ㅎ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅊ'], BASIC_V) },
  { id: 'u4', name: '그야여 행성', icon: '야', color: '#9EC5FF', items: grid(['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅅ', 'ㅇ', 'ㅈ'], ['ㅡ', 'ㅑ', 'ㅕ', 'ㅛ', 'ㅠ']) },
  { id: 'u5', name: '까따빠 행성', icon: '까', color: '#C8F27A', items: grid(['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'], BASIC_V) },
  {
    id: 'u6', name: '개와위 행성', icon: '와', color: '#FFD86B',
    items: syls([
      ['개', 'ㄱ', 'ㅐ'], ['내', 'ㄴ', 'ㅐ'], ['대', 'ㄷ', 'ㅐ'], ['새', 'ㅅ', 'ㅐ'], ['해', 'ㅎ', 'ㅐ'],
      ['게', 'ㄱ', 'ㅔ'], ['네', 'ㄴ', 'ㅔ'], ['세', 'ㅅ', 'ㅔ'], ['레', 'ㄹ', 'ㅔ'],
      ['과', 'ㄱ', 'ㅘ'], ['화', 'ㅎ', 'ㅘ'], ['와', 'ㅇ', 'ㅘ'], ['워', 'ㅇ', 'ㅝ'], ['뭐', 'ㅁ', 'ㅝ'],
      ['귀', 'ㄱ', 'ㅟ'], ['위', 'ㅇ', 'ㅟ'], ['쥐', 'ㅈ', 'ㅟ'], ['외', 'ㅇ', 'ㅚ'], ['회', 'ㅎ', 'ㅚ'], ['의', 'ㅇ', 'ㅢ']
    ])
  },
  {
    id: 'u7', name: '받침 행성', icon: '곰', color: '#B9A8FF',
    items: syls([
      ['각', 'ㄱ', 'ㅏ', 'ㄱ'], ['국', 'ㄱ', 'ㅜ', 'ㄱ'], ['밥', 'ㅂ', 'ㅏ', 'ㅂ'], ['밤', 'ㅂ', 'ㅏ', 'ㅁ'], ['문', 'ㅁ', 'ㅜ', 'ㄴ'],
      ['산', 'ㅅ', 'ㅏ', 'ㄴ'], ['손', 'ㅅ', 'ㅗ', 'ㄴ'], ['곰', 'ㄱ', 'ㅗ', 'ㅁ'], ['달', 'ㄷ', 'ㅏ', 'ㄹ'], ['물', 'ㅁ', 'ㅜ', 'ㄹ'],
      ['발', 'ㅂ', 'ㅏ', 'ㄹ'], ['강', 'ㄱ', 'ㅏ', 'ㅇ'], ['방', 'ㅂ', 'ㅏ', 'ㅇ'], ['공', 'ㄱ', 'ㅗ', 'ㅇ'], ['집', 'ㅈ', 'ㅣ', 'ㅂ']
    ])
  },
  {
    id: 'u8', name: '우리 가족 행성', icon: '엄마', color: '#FF8A3D',
    items: words(['엄마', '아빠', '태이', '태오 형', '판교 할머니', '포항 할머니', '망고', '사과', '포도', '바나나', '우유', '공룡', '하마', '나비', '사자'])
  },
  {
    id: 'u9', name: '문장 행성', icon: '문장', color: '#5ED3C7',
    items: words(['엄마 사랑해', '아빠 최고', '망고 맛있어', '공룡이 크다', '태이가 웃어요', '태오 형 안녕', '나비가 날아요', '할머니 보고 싶어요'], 'sentence')
  }
];

for (const u of UNITS) for (const it of u.items) { it.id = `${it.kind}:${it.text}`; it.unit = u.id; }

// Each planet is split into short stages of up to 5 items (for syllables that
// is one consonant row, e.g. 가 거 고 구 기).
export const STAGE_SIZE = 5;
for (const u of UNITS) {
  u.stages = [];
  for (let i = 0; i < u.items.length; i += STAGE_SIZE) {
    const items = u.items.slice(i, i + STAGE_SIZE);
    const st = { id: `${u.id}-${u.stages.length + 1}`, unit: u.id, n: u.stages.length + 1, items };
    items.forEach((it) => { it.stage = st.id; });
    u.stages.push(st);
  }
}
export const STAGE_BY_ID = Object.fromEntries(UNITS.flatMap((u) => u.stages.map((s) => [s.id, s])));

export const ALL_ITEMS = UNITS.flatMap((u) => u.items);
export const ITEM_BY_ID = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));
export const CURRICULUM_VERSION = 2;

// Words that have a picture (sticker art) for the picture → word game.
export const PICTURE = { '망고': 'mango', '사과': 'apple', '바나나': 'banana', '포도': 'grape', '공룡': 'trex', '엄마': 'mom', '아빠': 'dad', '태오 형': 'theo', '판교 할머니': 'grandmaP', '포항 할머니': 'grandmaH' };
