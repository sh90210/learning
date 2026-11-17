// 태이's Korean curriculum, World 1: "망고 섬".
// Reading is taught through short decodable words that have a picture and a
// sound (사과, 사자 …), not letter grids. Each chapter has 4 words split into
// short stages: two words, two more words, then all four together.
// Chapters are data: add new ones at the end and the map picks them up.

// word -> picture/sound key (assets/img/<key>.webp, assets/sfx/<key>.mp3)
export const MEDIA = {
  '사과': 'apple', '포도': 'grape', '바나나': 'banana', '우유': 'milk',
  '사자': 'lion', '하마': 'hippo', '나비': 'butterfly', '티라노': 'trex'
};

export const UNITS = [
  { id: 'c1', name: '간식 시간', pic: 'apple', color: '#FF8A3D', line: '냠냠! 간식 시간이야! 맛있는 낱말을 만나 보자!', words: ['사과', '포도', '바나나', '우유'] },
  { id: 'c2', name: '동물 친구', pic: 'lion', color: '#5ED3C7', line: '어흥! 동물 친구들을 만나러 가자!', words: ['사자', '하마', '나비', '티라노'] }
];

// Stops on the island map that aren't built yet (shown as "?").
export const COMING = 3;

for (const u of UNITS) {
  u.icon = u.name;
  u.items = u.words.map((text) => ({ text, kind: 'word', id: `word:${text}`, unit: u.id, syls: [...text], media: MEDIA[text] }));
  const [a, b, c, d] = u.items;
  u.stages = [
    { id: `${u.id}-1`, unit: u.id, n: 1, items: [a, b] },
    { id: `${u.id}-2`, unit: u.id, n: 2, items: [c, d] },
    { id: `${u.id}-3`, unit: u.id, n: 3, items: [a, b, c, d], review: true }
  ];
  a.stage = b.stage = `${u.id}-1`;
  c.stage = d.stage = `${u.id}-2`;
}
export const STAGE_SIZE = 2;
export const STAGE_BY_ID = Object.fromEntries(UNITS.flatMap((u) => u.stages.map((s) => [s.id, s])));

export const ALL_ITEMS = UNITS.flatMap((u) => u.items);
export const ITEM_BY_ID = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));
export const CURRICULUM_VERSION = 3;

// Kept for the old sticker-art picture game; words in MEDIA use real pictures.
export const PICTURE = {};

export const picUrl = (key) => `assets/img/${key}.webp`;
