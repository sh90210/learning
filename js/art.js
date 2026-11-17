// All pictures are small hand-made SVGs, so the app needs no image files.

// ---- 망고 and everything he can wear ------------------------------------------
// viewBox is -30 -30 260 270: body around (100,110), arms to the sides,
// legs below, pet at bottom right.
const BODY = 'M100 42 C150 42 174 86 168 126 C161 170 122 188 90 183 C52 177 30 142 35 106 C40 70 62 42 100 42Z';

export const SLOTS = ['back', 'effect', 'legs', 'feet', 'body', 'hands', 'face', 'head', 'pet', 'dance'];
export const SLOT_NAMES = { head: '모자', face: '얼굴', body: '옷', legs: '바지', feet: '신발', hands: '장갑', back: '등', dance: '춤', effect: '반짝이', pet: '친구' };

const ITEMS = {
  // head
  helmet: { slot: 'head', name: '우주 헬멧', price: 0, svg: () => `<circle cx="100" cy="108" r="90" fill="rgba(185,168,255,0.16)" stroke="#B9A8FF" stroke-width="5"/><path d="M44 70 Q60 38 96 30" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.7"/>` },
  ribbon: { slot: 'head', name: '리본', price: 30, svg: () => `<path d="M118 34 L96 18 L98 46 Z M126 34 L148 18 L146 46 Z" fill="#FF7EB6"/><circle cx="122" cy="34" r="8" fill="#FF4F9A"/>` },
  cap: { slot: 'head', name: '야구 모자', price: 40, svg: () => `<path d="M54 64 Q58 26 100 24 Q142 26 146 64 Z" fill="#3D7BFF"/><path d="M128 60 Q170 58 176 70 Q150 72 126 66 Z" fill="#2A5ACC"/><circle cx="100" cy="26" r="5" fill="#2A5ACC"/>` },
  antenna: { slot: 'head', name: '별 안테나', price: 50, svg: () => `<path d="M100 40 L100 2" stroke="#C9D1F2" stroke-width="4"/><path d="M100 -14 l5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1z" fill="#FFD86B"/>` },
  crown: { slot: 'head', name: '왕관', price: 60, svg: () => `<path d="M66 44 L72 14 L88 32 L100 8 L112 32 L128 14 L134 44 Z" fill="#FFD86B" stroke="#C9971F" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="32" r="5" fill="#FF5D73"/><circle cx="80" cy="38" r="4" fill="#5ED3C7"/><circle cx="120" cy="38" r="4" fill="#5ED3C7"/>` },
  dinohat: { slot: 'head', name: '공룡 모자', price: 80, svg: () => `<path d="M48 70 Q56 26 100 24 Q146 26 152 70 Q100 56 48 70Z" fill="#4CC76B"/><path d="M62 44 l8-18 8 14 M84 32 l8-20 8 16 M108 30 l8-18 8 16 M130 40 l8-14 6 16" fill="#2E9E4C" stroke="#2E9E4C" stroke-width="4" stroke-linejoin="round"/><circle cx="74" cy="56" r="4" fill="#FFFFFF"/><circle cx="126" cy="56" r="4" fill="#FFFFFF"/>` },
  wizard: { slot: 'head', name: '마법사 모자', price: 90, svg: () => `<path d="M58 58 L104 -18 L142 58 Z" fill="#7B5CFA"/><path d="M48 58 Q100 72 152 58 Q100 48 48 58Z" fill="#5A3FD1"/><path d="M98 10 l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z M118 36 l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" fill="#FFD86B"/>` },
  // face
  sunglasses: { slot: 'face', name: '선글라스', price: 40, svg: () => `<rect x="62" y="96" width="34" height="22" rx="9" fill="#151B3D"/><rect x="104" y="96" width="34" height="22" rx="9" fill="#151B3D"/><path d="M96 104 H104" stroke="#151B3D" stroke-width="4"/><path d="M68 100 l8 0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`, hidesEyes: true },
  heartglasses: { slot: 'face', name: '하트 안경', price: 50, svg: () => `<path d="M79 120 C60 106 64 92 74 94 C78 95 79 98 79 98 C79 98 80 95 84 94 C94 92 98 106 79 120Z M121 120 C102 106 106 92 116 94 C120 95 121 98 121 98 C121 98 122 95 126 94 C136 92 140 106 121 120Z" fill="#FF4F9A"/><path d="M92 102 H108" stroke="#FF4F9A" stroke-width="4"/>`, hidesEyes: true },
  mustache: { slot: 'face', name: '콧수염', price: 30, svg: () => `<path d="M100 122 C92 114 76 114 70 124 C80 122 88 128 100 124 C112 128 120 122 130 124 C124 114 108 114 100 122Z" fill="#5B3A1E"/>` },
  // body (shirts)
  stripes: { slot: 'body', name: '줄무늬 티셔츠', price: 40, svg: () => clipBody(`<rect x="20" y="138" width="170" height="60" fill="#FFFFFF"/><g fill="#FF5D73"><rect x="20" y="146" width="170" height="8"/><rect x="20" y="162" width="170" height="8"/><rect x="20" y="178" width="170" height="8"/></g>`) },
  spacesuit: { slot: 'body', name: '우주복', price: 70, svg: () => clipBody(`<rect x="20" y="136" width="170" height="60" fill="#E9EDF8"/><rect x="84" y="148" width="32" height="20" rx="4" fill="#5ED3C7"/><circle cx="92" cy="158" r="3" fill="#FF5D73"/><circle cx="108" cy="158" r="3" fill="#FFD86B"/>`) },
  superSuit: { slot: 'body', name: '슈퍼 망고 옷', price: 90, svg: () => clipBody(`<rect x="20" y="136" width="170" height="60" fill="#3D7BFF"/><path d="M100 144 l7 14 15 2-11 10 3 15-14-7-14 7 3-15-11-10 15-2z" fill="#FFD86B"/>`) },
  // legs
  bluepants: { slot: 'legs', name: '파란 바지', price: 30, svg: () => `<path d="M66 172 Q100 190 134 172 L132 204 L108 204 L102 188 L98 188 L92 204 L68 204 Z" fill="#3D7BFF"/>` },
  shorts: { slot: 'legs', name: '반바지', price: 30, svg: () => `<path d="M66 172 Q100 190 134 172 L134 194 L106 194 L100 184 L94 194 L66 194 Z" fill="#FF8A3D"/>` },
  dinopants: { slot: 'legs', name: '공룡 바지', price: 60, svg: () => `<path d="M66 172 Q100 190 134 172 L132 204 L108 204 L102 188 L98 188 L92 204 L68 204 Z" fill="#4CC76B"/><g fill="#2E9E4C"><circle cx="78" cy="190" r="4"/><circle cx="122" cy="190" r="4"/><circle cx="88" cy="198" r="3"/><circle cx="114" cy="198" r="3"/></g>` },
  // feet
  sneakers: { slot: 'feet', name: '운동화', price: 40, svg: () => shoes('#FFFFFF', '#FF5D73') },
  boots: { slot: 'feet', name: '장화', price: 40, svg: () => shoes('#FFD84D', '#E0A800', 12) },
  rocketshoes: { slot: 'feet', name: '로켓 신발', price: 100, svg: () => shoes('#C9D1F2', '#7B5CFA') + `<path class="flame" d="M64 228 L72 246 L80 228 Z M120 228 L128 246 L136 228 Z" fill="#FF8A3D"/>` },
  // hands
  whitegloves: { slot: 'hands', name: '하얀 장갑', price: 30, svg: () => hands('#FFFFFF') },
  boxing: { slot: 'hands', name: '권투 장갑', price: 60, svg: () => hands('#FF4D4D', 15) },
  wand: { slot: 'hands', name: '마법봉', price: 80, svg: () => `<path d="M186 140 L208 96" stroke="#7A4B22" stroke-width="5" stroke-linecap="round"/><path d="M210 80 l5 10 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1z" fill="#FFD86B"/>` },
  // back
  cape: { slot: 'back', name: '망토', price: 100, svg: () => `<path d="M58 110 Q24 180 46 214 L154 214 Q176 180 142 110 Z" fill="#FF5D73"/>` },
  wings: { slot: 'back', name: '날개', price: 120, svg: () => `<g class="flap"><path d="M44 110 C0 70 -14 130 10 150 C24 162 40 150 48 134 Z" fill="#FFFFFF" stroke="#C9D1F2" stroke-width="3"/><path d="M156 110 C200 70 214 130 190 150 C176 162 160 150 152 134 Z" fill="#FFFFFF" stroke="#C9D1F2" stroke-width="3"/></g>` },
  jetpack: { slot: 'back', name: '제트팩', price: 150, svg: () => `<rect x="30" y="90" width="26" height="70" rx="10" fill="#C9D1F2"/><rect x="144" y="90" width="26" height="70" rx="10" fill="#C9D1F2"/><path class="flame" d="M34 160 L43 186 L52 160 Z M148 160 L157 186 L166 160 Z" fill="#FF8A3D"/>` },
  // dances (no picture on the body; the whole 망고 moves)
  jump: { slot: 'dance', name: '깡충 점프', price: 50, dance: 'd-jump' },
  spin: { slot: 'dance', name: '빙글빙글', price: 60, dance: 'd-spin' },
  wiggle: { slot: 'dance', name: '엉덩이 흔들기', price: 70, dance: 'd-wiggle' },
  robot: { slot: 'dance', name: '로봇 춤', price: 90, dance: 'd-robot' },
  // effects
  sparkle: { slot: 'effect', name: '반짝반짝', price: 60, svg: () => `<g class="twinkle" fill="#FFD86B"><path d="M14 40 l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/><path d="M190 30 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M196 170 l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>` },
  rainbow: { slot: 'effect', name: '무지개', price: 80, svg: () => `<g fill="none" stroke-width="8" opacity="0.85"><path d="M-10 150 A110 110 0 0 1 210 150" stroke="#FF5D73"/><path d="M-2 150 A102 102 0 0 1 202 150" stroke="#FFD86B"/><path d="M6 150 A94 94 0 0 1 194 150" stroke="#4CC76B"/><path d="M14 150 A86 86 0 0 1 186 150" stroke="#3D7BFF"/></g>` },
  hearts: { slot: 'effect', name: '하트 뿅뿅', price: 70, svg: () => `<g class="float" fill="#FF4F9A"><path d="M20 60 C8 50 12 40 20 44 C28 40 32 50 20 60Z"/><path d="M184 50 C170 38 176 26 184 31 C192 26 198 38 184 50Z"/><path d="M196 150 C186 142 189 134 196 137 C203 134 206 142 196 150Z"/></g>` },
  // pets
  babydino: { slot: 'pet', name: '아기 공룡', price: 120, svg: () => `<g class="pet" transform="translate(178 168) scale(0.62)"><path d="M18 72 Q20 50 40 46 L58 44 Q60 26 74 22 Q90 20 92 34 Q92 44 80 46 L74 48 Q78 62 70 72 L66 86 L58 86 L58 74 L40 74 L38 86 L30 86 L30 74 Q18 76 18 72Z" fill="#4CC76B"/><circle cx="80" cy="31" r="3.5" fill="#151B3D"/></g>` },
  littlestar: { slot: 'pet', name: '꼬마 별', price: 90, svg: () => `<g class="pet" transform="translate(186 150)"><path d="M24 0 l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="#FFD86B"/><circle cx="19" cy="20" r="2.5" fill="#151B3D"/><circle cx="29" cy="20" r="2.5" fill="#151B3D"/></g>` }
};

function clipBody(inner) {
  return `<clipPath id="mbody"><path d="${BODY}"/></clipPath><g clip-path="url(#mbody)">${inner}</g>`;
}
function shoes(c, sole, h = 0) {
  return `<path d="M58 ${214 - h} h28 v${12 + h} h-34 q-4 -12 6 -12z M114 ${214 - h} h28 q10 0 6 12 h-34z" fill="${c}"/><path d="M52 226 h34 M114 226 h34" stroke="${sole}" stroke-width="5" stroke-linecap="round"/>`;
}
function hands(c, r = 11) {
  return `<circle cx="14" cy="146" r="${r}" fill="${c}" stroke="#C9C9C9" stroke-width="2"/><circle cx="186" cy="146" r="${r}" fill="${c}" stroke="#C9C9C9" stroke-width="2"/>`;
}

export const SHOP = Object.entries(ITEMS).map(([id, it]) => ({ id, ...it }));
export const SHOP_BY_ID = Object.fromEntries(SHOP.map((s) => [s.id, s]));

export function mango({ equipped = {}, size = 200, mood = 'happy', dancing = false } = {}) {
  const get = (slot) => { const it = ITEMS[equipped[slot]]; return it && it.svg ? it.svg() : ''; };
  const faceItem = ITEMS[equipped.face];
  const mouth = mood === 'wow'
    ? '<ellipse cx="100" cy="136" rx="9" ry="11" fill="#7A2E1A"/>'
    : '<path d="M86 130 Q100 146 114 130" fill="none" stroke="#7A2E1A" stroke-width="5" stroke-linecap="round"/>';
  const eyes = faceItem && faceItem.hidesEyes ? '' : `<circle cx="82" cy="108" r="8" fill="#2B1B12"/><circle cx="118" cy="108" r="8" fill="#2B1B12"/>
    <circle cx="85" cy="105" r="2.6" fill="#FFFFFF"/><circle cx="121" cy="105" r="2.6" fill="#FFFFFF"/>`;
  const dance = ITEMS[equipped.dance]?.dance || 'd-bounce';
  const h = Math.round(size * 270 / 260);
  return `<svg class="mango ${dance}${dancing ? ' dancing' : ''}" width="${size}" height="${h}" viewBox="-30 -30 260 270" aria-hidden="true">
    ${get('effect')}${get('back')}
    <g stroke="#E0941A" stroke-width="7" stroke-linecap="round"><path d="M40 128 L16 146"/><path d="M160 128 L184 146"/><path d="M82 178 L80 214"/><path d="M118 178 L120 214"/></g>
    <circle cx="14" cy="146" r="8" fill="#FFB627"/><circle cx="186" cy="146" r="8" fill="#FFB627"/>
    <ellipse cx="74" cy="220" rx="14" ry="7" fill="#E0941A"/><ellipse cx="126" cy="220" rx="14" ry="7" fill="#E0941A"/>
    ${get('legs')}${get('feet')}
    <path d="${BODY}" fill="#FFB627"/>
    <path d="M150 70 C172 98 168 150 130 176 C150 140 154 104 150 70Z" fill="#FF8A3D" opacity="0.75"/>
    ${get('body')}
    <path d="M100 44 C104 26 122 16 140 20 C132 36 118 44 100 44Z" fill="#3FAE5A"/>
    <path d="M100 46 L98 34" stroke="#7A4B22" stroke-width="4" stroke-linecap="round"/>
    ${eyes}
    <circle cx="66" cy="126" r="9" fill="#FF7A6B" opacity="0.55"/><circle cx="134" cy="126" r="9" fill="#FF7A6B" opacity="0.55"/>
    ${mouth}
    ${get('face')}${get('hands')}${get('head')}${get('pet')}
  </svg>`;
}

export function shopIcon(id) {
  const it = ITEMS[id];
  if (!it) return '';
  if (it.slot === 'dance') return mango({ equipped: { dance: id }, size: 110, dancing: true });
  return mango({ equipped: { [it.slot]: id }, size: 110 });
}

// ---- stickers ----------------------------------------------------------------
const fruit = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
const DINO_BASE = (color, extra = '') => `<svg viewBox="0 0 100 100" aria-hidden="true">${extra}
  <path d="M18 72 Q20 50 40 46 L58 44 Q60 26 74 22 Q90 20 92 34 Q92 44 80 46 L74 48 Q78 62 70 72 L66 86 L58 86 L58 74 L40 74 L38 86 L30 86 L30 74 Q18 76 18 72Z" fill="${color}"/>
  <circle cx="80" cy="31" r="3.5" fill="#151B3D"/><path d="M84 40 Q88 41 90 38" stroke="#151B3D" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const FACE_ICON = (skin, hair, extra = '') => `<svg viewBox="0 0 100 100" aria-hidden="true">
  ${hair}<circle cx="50" cy="54" r="28" fill="${skin}"/>${extra}
  <circle cx="40" cy="52" r="3.5" fill="#2B1B12"/><circle cx="60" cy="52" r="3.5" fill="#2B1B12"/>
  <path d="M41 64 Q50 72 59 64" fill="none" stroke="#7A2E1A" stroke-width="3" stroke-linecap="round"/>
  <circle cx="34" cy="62" r="4.5" fill="#FF9AA2" opacity="0.6"/><circle cx="66" cy="62" r="4.5" fill="#FF9AA2" opacity="0.6"/></svg>`;

export const STICKERS = [
  // 과일
  { id: 'mango', set: '과일', word: '망고', svg: () => mango({ size: 100 }) },
  { id: 'apple', set: '과일', word: '사과', svg: () => fruit('<circle cx="50" cy="56" r="30" fill="#FF4D4D"/><path d="M50 28 Q52 18 60 14" stroke="#7A4B22" stroke-width="4" fill="none"/><path d="M54 24 Q68 14 76 24 Q64 32 54 24Z" fill="#3FAE5A"/>') },
  { id: 'banana', set: '과일', word: '바나나', svg: () => fruit('<path d="M20 30 Q30 80 80 74 Q86 70 82 66 Q40 66 30 26 Z" fill="#FFD84D"/><path d="M20 30 l-4 -6" stroke="#7A4B22" stroke-width="5" stroke-linecap="round"/>') },
  { id: 'grape', set: '과일', word: '포도', svg: () => fruit('<g fill="#8E5BD6"><circle cx="40" cy="40" r="10"/><circle cx="60" cy="40" r="10"/><circle cx="50" cy="56" r="10"/><circle cx="30" cy="56" r="10"/><circle cx="70" cy="56" r="10"/><circle cx="40" cy="72" r="10"/><circle cx="60" cy="72" r="10"/><circle cx="50" cy="86" r="9"/></g><path d="M50 30 L52 16" stroke="#7A4B22" stroke-width="4"/>') },
  { id: 'watermelon', set: '과일', word: '수박', svg: () => fruit('<path d="M10 40 A40 40 0 0 0 90 40 Z" fill="#2E9E4C"/><path d="M16 40 A34 34 0 0 0 84 40 Z" fill="#FF5D73"/><g fill="#151B3D"><circle cx="36" cy="52" r="3"/><circle cx="50" cy="58" r="3"/><circle cx="64" cy="52" r="3"/></g>') },
  // 공룡
  { id: 'trex', set: '공룡', word: '티라노', svg: () => DINO_BASE('#4CC76B') },
  { id: 'stego', set: '공룡', word: '스테고', svg: () => DINO_BASE('#FF8A3D', '<path d="M30 48 l6-14 6 12 6-16 6 16 6-14 4 14" fill="#FFD86B"/>') },
  { id: 'trike', set: '공룡', word: '트리케라', svg: () => DINO_BASE('#5ED3C7', '<path d="M70 26 L64 8 L76 22 Z M84 22 L90 4 L90 22 Z" fill="#FFFFFF"/><path d="M60 40 Q62 18 80 16" stroke="#3A9E94" stroke-width="8" fill="none"/>') },
  { id: 'bronto', set: '공룡', word: '브라키오', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M14 80 Q16 58 40 56 L58 56 Q64 30 70 14 Q78 6 86 12 Q90 18 82 22 L74 26 Q72 50 72 62 Q76 76 70 80 L66 90 L58 90 L58 80 L40 80 L38 90 L30 90 L30 80 Z" fill="#9EC5FF"/><circle cx="82" cy="15" r="2.5" fill="#151B3D"/></svg>` },
  { id: 'ptero', set: '공룡', word: '프테라', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M8 50 Q30 24 48 44 Q50 34 58 32 L80 26 L62 38 Q70 30 92 50 Q70 46 56 58 L48 58 Q30 46 8 50Z" fill="#FF9AC4"/><circle cx="60" cy="36" r="2.5" fill="#151B3D"/></svg>` },
  // 가족
  { id: 'mom', set: '가족', word: '엄마', svg: () => FACE_ICON('#FFE0C2', '<path d="M18 60 Q14 20 50 18 Q86 20 82 60 Q80 80 70 84 L70 56 L30 56 L30 84 Q20 80 18 60Z" fill="#3B2A20"/>') },
  { id: 'dad', set: '가족', word: '아빠', svg: () => FACE_ICON('#F6D3B0', '<path d="M22 50 Q22 22 50 20 Q78 22 78 50 Q70 34 50 34 Q30 34 22 50Z" fill="#2B1B12"/>', '<rect x="32" y="46" width="14" height="10" rx="4" fill="none" stroke="#2B1B12" stroke-width="2.5"/><rect x="54" y="46" width="14" height="10" rx="4" fill="none" stroke="#2B1B12" stroke-width="2.5"/>') },
  { id: 'theo', set: '가족', word: '태오 형', svg: () => FACE_ICON('#FFE0C2', '<path d="M22 50 Q20 22 50 20 Q80 22 78 50 L70 38 L60 44 L50 34 L40 44 L30 38 Z" fill="#3B2A20"/>') },
  { id: 'grandmaP', set: '가족', word: '판교 할머니', svg: () => FACE_ICON('#FFE6CF', '<circle cx="50" cy="22" r="12" fill="#C9C9C9"/><path d="M22 56 Q20 26 50 26 Q80 26 78 56 Q70 40 50 40 Q30 40 22 56Z" fill="#C9C9C9"/>') },
  { id: 'grandmaH', set: '가족', word: '포항 할머니', svg: () => FACE_ICON('#F8DCC0', '<path d="M20 64 Q16 24 50 24 Q84 24 80 64 Q74 42 50 42 Q26 42 20 64Z" fill="#9A9A9A"/>', '<path d="M66 30 q10 -6 14 4 q-10 6 -14 -4z" fill="#FF7EB6"/>') },
  // 우주
  { id: 'rocket', set: '우주', word: '로켓', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 C68 22 72 48 66 70 H34 C28 48 32 22 50 8Z" fill="#FFFFFF"/><circle cx="50" cy="38" r="8" fill="#7B5CFA"/><path d="M34 62 L20 80 L36 76 Z M66 62 L80 80 L64 76 Z" fill="#FF8A3D"/><path d="M42 72 H58 L50 94 Z" fill="#FFD86B"/></svg>` },
  { id: 'star', set: '우주', word: '별', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 8 l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3z" fill="#FFD86B"/></svg>` },
  { id: 'moon', set: '우주', word: '달', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M62 10 A40 40 0 1 0 90 62 A32 32 0 1 1 62 10Z" fill="#FFE9A8"/><circle cx="40" cy="60" r="5" fill="#F2D27A"/><circle cx="30" cy="40" r="3" fill="#F2D27A"/></svg>` },
  { id: 'planet', set: '우주', word: '행성', svg: () => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="26" fill="#FF9AC4"/><ellipse cx="50" cy="54" rx="46" ry="12" fill="none" stroke="#FFD86B" stroke-width="6"/></svg>` }
];

export const STICKER_BY_ID = Object.fromEntries(STICKERS.map((s) => [s.id, s]));
export const STICKER_SETS = ['과일', '공룡', '가족', '우주'];

// ---- icons ----------------------------------------------------------------
export const ICON = {
  fire: () => `<svg viewBox="0 0 16 18" aria-hidden="true"><path d="M8 1c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4 3-7 1 2 2 2 3 2 0-2 0-4 0-6z" fill="#FF8A3D"/><path d="M8 9c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1-3 1 1 2 0 2-2z" fill="#FFD86B"/></svg>`,
  chest: (open = false) => `<svg viewBox="0 0 120 100" aria-hidden="true">${open ? '<g stroke="#FFD86B" stroke-width="5" stroke-linecap="round"><path d="M60 30 V4"/><path d="M36 34 L22 12"/><path d="M84 34 L98 12"/></g><circle cx="60" cy="40" r="12" fill="#FFD86B"/>' : ''}<rect x="10" y="44" width="100" height="50" rx="8" fill="#B5651D"/><path d="M10 ${open ? 30 : 44} Q60 ${open ? -4 : 10} 110 ${open ? 30 : 44} L110 ${open ? 40 : 56} L10 ${open ? 40 : 56}Z" fill="#D9822B"/><rect x="52" y="48" width="16" height="20" rx="3" fill="#FFD86B"/><rect x="10" y="62" width="100" height="6" fill="#8A4A12"/></svg>`,
  prev: () => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 3l-7 7 7 7" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  next: () => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3l7 7-7 7" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  speaker: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="${c}"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  close: () => `<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  back: () => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  star: (c = '#FFD86B') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.5 6.6-.8z" fill="${c}"/></svg>`,
  lock: (c = '#C9D1F2') => `<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="8" width="12" height="9" rx="2" fill="none" stroke="${c}" stroke-width="2"/><path d="M6 8V5.5a3 3 0 0 1 6 0V8" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
  mic: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="2" width="8" height="13" rx="4" fill="${c}"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  check: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  rocket: () => STICKER_BY_ID.rocket.svg(),
  book: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-5a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h5z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  shop: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.5 11h-13z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M8 9V7a4 4 0 0 1 8 0v2" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
  erase: (c = '#FFFFFF') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
