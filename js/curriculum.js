// 태이's Korean curriculum, World 1: "망고 섬".
// Reading is taught through short decodable words that have a picture and a
// sound (사과, 사자 …), not letter grids. Each chapter has 4 words split into
// short stages: two words, two more words, then all four together.
// Chapters are data: add new ones at the end and the map picks them up.

// word -> picture/sound key (assets/img/<key>.webp, assets/sfx/<key>.mp3)
export const MEDIA = {
  '사과': 'apple', '포도': 'grape', '바나나': 'banana', '우유': 'milk',
  '사자': 'lion', '하마': 'hippo', '나비': 'butterfly', '티라노': 'trex',
  '기차': 'train', '버스': 'bus', '배': 'boat', '오토바이': 'motorcycle',
  '고래': 'whale', '새우': 'shrimp', '해마': 'seahorse', '게': 'crab',
  '코': 'nose', '귀': 'ear', '머리': 'head', '다리': 'legs',
  '소': 'cow', '돼지': 'pig', '오리': 'duck', '개미': 'ant',
  '모자': 'hat', '의자': 'chair', '시계': 'clock', '가위': 'scissors',
  '피자': 'pizza', '토마토': 'tomato', '고구마': 'sweetpotato', '키위': 'kiwi'
};

export const UNITS = [
  { id: 'c1', name: '간식 시간', pic: 'apple', color: '#FF8A3D', line: '냠냠! 간식 시간이야! 맛있는 낱말을 만나 보자!', words: ['사과', '포도', '바나나', '우유'] },
  { id: 'c2', name: '동물 친구', pic: 'lion', color: '#5ED3C7', line: '어흥! 동물 친구들을 만나러 가자!', words: ['사자', '하마', '나비', '티라노'] },
  { id: 'c3', name: '부릉부릉 탈것', pic: 'train', color: '#FF6B6B', words: ['기차', '버스', '배', '오토바이'] },
  { id: 'c4', name: '바다 친구', pic: 'whale', color: '#4D8BFF', words: ['고래', '새우', '해마', '게'] },
  { id: 'c5', name: '내 몸', pic: 'nose', color: '#FF9AC4', words: ['코', '귀', '머리', '다리'] },
  { id: 'c6', name: '농장 친구', pic: 'cow', color: '#7BC86C', words: ['소', '돼지', '오리', '개미'] },
  { id: 'c7', name: '우리 집', pic: 'clock', color: '#B48CFF', words: ['모자', '의자', '시계', '가위'] },
  { id: 'c8', name: '맛있는 요리', pic: 'pizza', color: '#FFB347', words: ['피자', '토마토', '고구마', '키위'] }
];

// Short picture stories built only from words he has met, plus 가/도/로/에/요.
// Each page: the sentence (recorded whole) and the pictures to show.
export const STORIES = [
  { id: 's1', name: '바다로 가요', after: 'c4', pic: 'boat', color: '#2BB5A8', pages: [
    { text: '기차가 가요.', pics: ['train'] },
    { text: '버스도 가요.', pics: ['bus'] },
    { text: '배가 바다로 가요.', pics: ['boat'] },
    { text: '고래가 커요!', pics: ['whale'] },
    { text: '새우가 자요. 쉬!', pics: ['shrimp'] },
    { text: '모두 바다로 가요!', pics: ['train', 'bus', 'boat', 'whale', 'shrimp'] }
  ] },
  { id: 's2', name: '티라노의 요리', after: 'c8', pic: 'trex', color: '#FF8A3D', pages: [
    { text: '티라노가 와요.', pics: ['trex'] },
    { text: '티라노 머리에 모자!', pics: ['trex', 'hat'] },
    { text: '피자 주세요!', pics: ['pizza'] },
    { text: '토마토도 주세요!', pics: ['tomato'] },
    { text: '돼지도 와요. 오리도 와요.', pics: ['pig', 'duck'] },
    { text: '모두 하하 호호!', pics: ['trex', 'pig', 'duck', 'pizza'] }
  ] }
];
export const STORY_BY_ID = Object.fromEntries(STORIES.map((s) => [s.id, s]));
// the island path: chapters with each story right after the chapter it follows
export const MAP_ORDER = UNITS.flatMap((u) => [u.id, ...STORIES.filter((s) => s.after === u.id).map((s) => s.id)]);

// Stops on the island map that aren't built yet (shown as "?").
export const COMING = 2;

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
