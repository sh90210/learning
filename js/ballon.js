// Ballon: 태오's soccer player. Front-facing chibi drawn as SVG, dressed from slots.
// Kits are national-team colours with a name and number: no crests, logos or sponsors.

export const KITS = {
  basic: { name: 'Training Kit', who: 'Ballon', jersey: '#F4F6FB', trim: '#2BB5A8', shorts: '#1E2A55', socks: '#F4F6FB', num: '', numC: '#1E2A55' },
  yamal: { name: 'Spain #19', who: 'Yamal', jersey: '#C8102E', trim: '#FFC400', shorts: '#0B2A5B', socks: '#0B2A5B', num: '19', numC: '#FFC400' },
  messi: { name: 'Argentina #10', who: 'Messi', jersey: '#FFFFFF', stripes: '#75AADB', trim: '#1E2A55', shorts: '#1B1B2A', socks: '#FFFFFF', num: '10', numC: '#1B1B2A' },
  ronaldo: { name: 'Portugal #7', who: 'Ronaldo', jersey: '#B5121B', trim: '#0B6B2E', shorts: '#0B6B2E', socks: '#B5121B', num: '7', numC: '#F2C14E' },
  haaland: { name: 'Norway #9', who: 'Haaland', jersey: '#BA0C2F', trim: '#00205B', shorts: '#FFFFFF', socks: '#00205B', num: '9', numC: '#FFFFFF' },
  vinicius: { name: 'Brazil #7', who: 'Vinícius', jersey: '#FFDF00', trim: '#009C3B', shorts: '#1E4FA3', socks: '#FFFFFF', num: '7', numC: '#009C3B' },
  son: { name: 'Korea #7', who: 'Son', jersey: '#E2231A', trim: '#111111', shorts: '#111111', socks: '#E2231A', num: '7', numC: '#FFFFFF' },
  maradona: { name: 'Argentina 1986 #10', who: 'Maradona', jersey: '#FFFFFF', stripes: '#6CACE4', trim: '#6CACE4', shorts: '#14213D', socks: '#FFFFFF', num: '10', numC: '#14213D', retro: true },
  zidane: { name: 'France #10', who: 'Zidane', jersey: '#1C2C5B', trim: '#E4002B', shorts: '#FFFFFF', socks: '#E4002B', num: '10', numC: '#FFFFFF' },
  pele: { name: 'Brazil 1970 #10', who: 'Pelé', jersey: '#FFDF00', trim: '#009C3B', shorts: '#2A5CAA', socks: '#FFFFFF', num: '10', numC: '#009C3B', retro: true }
};
const BOOTS = { black: '#1B1B2A', neon: '#B6FF2E', pink: '#FF4FA3', gold: '#F2C14E', redwhite: '#E2231A', blue: '#2E7BFF' };

export const SHOP = [
  // kits: jersey + shorts (+ socks)
  ...Object.entries(KITS).map(([id, k]) => ({ id: `kit-${id}`, slot: 'kit', kit: id, name: k.who === 'Ballon' ? 'Training Kit' : k.who, sub: k.name, price: id === 'basic' ? 0 : ['maradona', 'zidane', 'pele'].includes(id) ? 300 : 200 })),
  // hair
  { id: 'hair-short', slot: 'hair', hair: 'short', name: 'Classic', price: 0 },
  { id: 'hair-spiky', slot: 'hair', hair: 'spiky', name: 'Spiky', price: 80 },
  { id: 'hair-mohawk', slot: 'hair', hair: 'mohawk', name: 'Red Mohawk', price: 120 },
  { id: 'hair-blond', slot: 'hair', hair: 'blond', name: 'Bleached Spikes', price: 120 },
  { id: 'hair-afro', slot: 'hair', hair: 'afro', name: 'Big Afro', price: 150 },
  { id: 'hair-curly', slot: 'hair', hair: 'curly', name: 'Giant Blond Curls', price: 180 },
  { id: 'hair-bun', slot: 'hair', hair: 'bun', name: 'Man Bun', price: 120 },
  { id: 'hair-rainbow', slot: 'hair', hair: 'rainbow', name: 'Rainbow Spikes', price: 220 },
  { id: 'hair-flame', slot: 'hair', hair: 'flame', name: 'Fire Hair', price: 250 },
  // boots
  { id: 'boots-black', slot: 'boots', boots: 'black', name: 'Basic Boots', price: 0 },
  { id: 'boots-neon', slot: 'boots', boots: 'neon', name: 'Neon Green', price: 80 },
  { id: 'boots-pink', slot: 'boots', boots: 'pink', name: 'Hot Pink', price: 80 },
  { id: 'boots-blue', slot: 'boots', boots: 'blue', name: 'Lightning Blue', price: 100 },
  { id: 'boots-redwhite', slot: 'boots', boots: 'redwhite', name: 'Red Rockets', price: 100 },
  { id: 'boots-gold', slot: 'boots', boots: 'gold', name: 'Golden Boots', price: 200 },
  // balls
  { id: 'ball-classic', slot: 'ball', ball: 'classic', name: 'Basic Ball', price: 0 },
  { id: 'ball-retro', slot: 'ball', ball: 'retro', name: 'Retro Leather', price: 80 },
  { id: 'ball-fire', slot: 'ball', ball: 'fire', name: 'Fire Ball', price: 150 },
  { id: 'ball-rainbow', slot: 'ball', ball: 'rainbow', name: 'Rainbow Ball', price: 150 },
  { id: 'ball-planet', slot: 'ball', ball: 'planet', name: 'Planet Ball', price: 180 },
  { id: 'ball-gold', slot: 'ball', ball: 'gold', name: 'Golden Ball', price: 250 },
  // gear
  { id: 'arm-captain', slot: 'arm', arm: 'captain', name: 'Captain Armband', price: 100 },
  { id: 'arm-rainbow', slot: 'arm', arm: 'rainbow', name: 'Rainbow Armband', price: 100 },
  { id: 'gear-headband', slot: 'gear', gear: 'headband', name: 'Headband', price: 60 },
  { id: 'gear-wrist', slot: 'gear', gear: 'wrist', name: 'Wristbands', price: 60 },
  { id: 'gear-gloves', slot: 'gear', gear: 'gloves', name: 'Keeper Gloves', price: 100 },
  { id: 'gear-paint', slot: 'gear', gear: 'paint', name: 'Face Paint', price: 80 },
  { id: 'gear-shades', slot: 'gear', gear: 'shades', name: 'Cool Shades', price: 120 },
  // celebrations
  { id: 'cel-fist', slot: 'celebrate', cel: 'fist', name: 'Fist Pump', price: 0 },
  { id: 'cel-siuuu', slot: 'celebrate', cel: 'siuuu', name: 'Spin Jump', price: 200 },
  { id: 'cel-camera', slot: 'celebrate', cel: 'camera', name: 'Camera Click', price: 180 },
  { id: 'cel-zen', slot: 'celebrate', cel: 'zen', name: 'Zen Float', price: 180 },
  { id: 'cel-airplane', slot: 'celebrate', cel: 'airplane', name: 'Airplane', price: 120 },
  { id: 'cel-slide', slot: 'celebrate', cel: 'slide', name: 'Knee Slide', price: 150 },
  { id: 'cel-backflip', slot: 'celebrate', cel: 'backflip', name: 'Backflip', price: 220 },
  { id: 'cel-samba', slot: 'celebrate', cel: 'samba', name: 'Samba Dance', price: 180 },
  { id: 'cel-shush', slot: 'celebrate', cel: 'shush', name: 'Shush!', price: 120 },
  // effects
  { id: 'fx-stars', slot: 'fx', fx: 'stars', name: 'Star Sparkles', price: 150 },
  { id: 'fx-fire', slot: 'fx', fx: 'fire', name: 'Fire Aura', price: 220 },
  { id: 'fx-lightning', slot: 'fx', fx: 'lightning', name: 'Lightning', price: 220 },
  { id: 'fx-confetti', slot: 'fx', fx: 'confetti', name: 'Confetti', price: 150 }
];
export const SHOP_BY_ID = Object.fromEntries(SHOP.map((s) => [s.id, s]));
export const TABS = [['kit', 'Kits'], ['hair', 'Hair'], ['boots', 'Boots'], ['ball', 'Balls'], ['arm', 'Armbands'], ['gear', 'Gear'], ['celebrate', 'Celebrations'], ['fx', 'Effects']];
export const DEFAULT_EQUIPPED = { kit: 'kit-basic', hair: 'hair-short', boots: 'boots-black', ball: 'ball-classic', celebrate: 'cel-fist' };
export const CEL_SECONDS = { fist: 1.6, siuuu: 2.2, camera: 2.4, zen: 3, airplane: 2.6, slide: 2.2, backflip: 1.8, samba: 2.6, shush: 2.2 };

let uid = 0;
const SKIN = '#F2C9A0', SKIN_D = '#E2B286';

function hairParts(h) {
  // returns [back, front]
  switch (h) {
    case 'spiky': return ['', `<path d="M60 64 L58 40 L70 46 L72 22 L84 38 L94 16 L102 36 L114 18 L118 40 L132 26 L130 46 L142 44 L140 64 Q128 44 100 44 Q72 44 60 64Z" fill="#1B1B2A"/>`];
    case 'mohawk': return ['', `<path d="M62 60 Q64 34 100 30 Q136 34 138 60 Q130 44 100 44 Q70 44 62 60Z" fill="#3A2A20" opacity=".55"/><path d="M90 46 L86 14 L96 22 L100 4 L106 22 L116 14 L110 46Z" fill="#E2231A"/>`];
    case 'blond': return ['', `<path d="M60 64 L58 40 L70 46 L72 22 L84 38 L94 16 L102 36 L114 18 L118 40 L132 26 L130 46 L142 44 L140 64 Q128 44 100 44 Q72 44 60 64Z" fill="#F6E27A"/>`];
    case 'afro': return [`<circle cx="100" cy="48" r="56" fill="#3A2416"/>`, `<path d="M58 62 Q60 34 100 30 Q140 34 142 62 Q130 46 100 46 Q70 46 58 62Z" fill="#3A2416"/>`];
    case 'curly': return [`<g fill="#F2D06B">${[[60, 60], [56, 38], [70, 20], [92, 10], [114, 12], [134, 24], [146, 44], [142, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22"/>`).join('')}</g>`, `<g fill="#F7DC86">${[[72, 40], [92, 32], [112, 32], [130, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14"/>`).join('')}</g>`];
    case 'bun': return ['', `<path d="M60 62 Q62 24 100 24 Q138 24 140 62 Q128 42 100 42 Q72 42 60 62Z" fill="#2A1C14"/><circle cx="100" cy="16" r="14" fill="#2A1C14"/><rect x="88" y="26" width="24" height="5" rx="2" fill="#2BB5A8"/>`];
    case 'rainbow': {
      const id = `rb${uid++}`;
      return ['', `<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#FF4F4F"/><stop offset=".25" stop-color="#FFB347"/><stop offset=".5" stop-color="#FFE14D"/><stop offset=".75" stop-color="#4FD18B"/><stop offset="1" stop-color="#4F8BFF"/></linearGradient></defs><path d="M58 64 L54 34 L70 44 L70 14 L86 36 L96 6 L104 34 L118 8 L120 38 L136 20 L132 46 L146 40 L142 64 Q128 44 100 44 Q72 44 58 64Z" fill="url(#${id})"/>`];
    }
    case 'flame': return ['', `<g class="b-flame"><path d="M58 64 Q50 34 70 30 Q66 14 84 10 Q86 24 96 4 Q104 22 112 8 Q118 24 132 16 Q130 32 146 36 Q148 52 142 64 Q128 44 100 44 Q72 44 58 64Z" fill="#FF6A1A"/><path d="M70 56 Q66 38 80 34 Q82 22 94 20 Q98 32 106 20 Q114 32 124 30 Q132 40 130 56 Q116 46 100 46 Q82 46 70 56Z" fill="#FFD23F"/></g>`];
    default: return ['', `<path d="M60 64 Q60 22 100 22 Q140 22 140 64 Q132 42 104 42 Q92 50 80 44 Q66 46 60 64Z" fill="#1B1B2A"/>`];
  }
}

function ballSvg(kind, cx, cy, r) {
  const id = `bl${uid++}`;
  const fill = { classic: '#FFFFFF', retro: '#B5763A', fire: '#FF7A1A', rainbow: `url(#${id})`, planet: '#3E8EDE', gold: '#F2C14E' }[kind] || '#FFFFFF';
  const spot = { classic: '#1B1B2A', retro: '#7A4A1E', fire: '#FFD23F', rainbow: '#FFFFFF', planet: '#4FBF5A', gold: '#C8932A' }[kind] || '#1B1B2A';
  const defs = kind === 'rainbow' ? `<defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FF4F4F"/><stop offset=".33" stop-color="#FFE14D"/><stop offset=".66" stop-color="#4FD18B"/><stop offset="1" stop-color="#4F8BFF"/></linearGradient></defs>` : '';
  const flames = kind === 'fire' ? `<path class="b-flame" d="M${cx - r} ${cy} Q${cx - r - 12} ${cy - 8} ${cx - r - 22} ${cy - 2} Q${cx - r - 10} ${cy + 4} ${cx - r - 20} ${cy + 12} Q${cx - r - 6} ${cy + 10} ${cx - r} ${cy + 6}Z" fill="#FFB347"/>` : '';
  const pattern = kind === 'retro'
    ? `<path d="M${cx - r} ${cy} H${cx + r} M${cx} ${cy - r} V${cy + r}" stroke="${spot}" stroke-width="2"/>`
    : kind === 'planet'
      ? `<path d="M${cx - 8} ${cy - 10} q6 -4 10 2 q-2 6 -8 4z M${cx + 2} ${cy + 4} q8 -2 8 6 q-6 4 -10 -2z" fill="${spot}"/>`
      : `<polygon points="${[0, 1, 2, 3, 4].map((i) => `${(cx + r * 0.42 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 5)).toFixed(1)},${(cy + r * 0.42 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 5)).toFixed(1)}`).join(' ')}" fill="${spot}"/>`;
  return `${defs}<g class="b-ball">${flames}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#1B1B2A" stroke-width="2.5"/>${pattern}${kind === 'gold' ? `<circle cx="${cx - 5}" cy="${cy - 6}" r="4" fill="#FFF3C4"/>` : ''}</g>`;
}

function fxSvg(fx) {
  switch (fx) {
    case 'stars': return `<g class="b-twinkle" fill="#FFD86B">${[[30, 60], [170, 50], [20, 160], [180, 170], [100, 6]].map(([x, y], i) => `<path style="animation-delay:${i * 0.3}s" transform="translate(${x} ${y})" d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z"/>`).join('')}</g>`;
    case 'fire': return `<g class="b-flame" opacity=".85"><path d="M40 250 Q20 180 50 140 Q46 170 64 170 Q56 120 84 96 Q84 130 100 130 Q100 90 124 70 Q118 120 138 128 Q140 104 158 100 Q150 140 168 160 Q184 200 160 250Z" fill="#FF6A1A"/><path d="M60 250 Q48 200 70 180 Q72 200 86 196 Q84 160 104 140 Q108 170 124 168 Q124 150 140 146 Q136 180 150 196 Q160 220 146 250Z" fill="#FFD23F" opacity=".8"/></g>`;
    case 'lightning': return `<g class="b-twinkle" fill="#FFE14D" stroke="#FFFFFF" stroke-width="2">${[[22, 60, 1], [168, 40, -1], [16, 170, 1], [176, 160, -1]].map(([x, y, s], i) => `<path style="animation-delay:${i * 0.25}s" transform="translate(${x} ${y}) scale(${s} 1)" d="M0 0 L14 0 L6 16 L16 16 L-4 44 L2 22 L-8 22Z"/>`).join('')}</g>`;
    case 'confetti': return `<g class="b-confetti">${Array.from({ length: 16 }, (_, i) => `<rect x="${10 + ((i * 37) % 180)}" y="${(i * 53) % 220}" width="8" height="12" rx="2" fill="${['#FF4F4F', '#FFE14D', '#4FD18B', '#4F8BFF', '#FF9AC4'][i % 5]}" style="animation-delay:${(i % 8) * 0.2}s" transform="rotate(${i * 23} ${14 + ((i * 37) % 180)} ${(i * 53) % 220})"/>`).join('')}</g>`;
    default: return '';
  }
}

// equipped: { kit, hair, boots, ball, arm, gear, fx, celebrate } as SHOP ids
export function ballon({ equipped = DEFAULT_EQUIPPED, size = 220, cls = '' } = {}) {
  const get = (slot) => SHOP_BY_ID[equipped[slot]] || SHOP_BY_ID[DEFAULT_EQUIPPED[slot]] || null;
  const k = KITS[get('kit').kit];
  const [hairBack, hairFront] = hairParts(get('hair').hair);
  const boot = BOOTS[get('boots').boots];
  const ball = get('ball').ball;
  const arm = equipped.arm && SHOP_BY_ID[equipped.arm] ? SHOP_BY_ID[equipped.arm].arm : null;
  const gear = equipped.gear && SHOP_BY_ID[equipped.gear] ? SHOP_BY_ID[equipped.gear].gear : null;
  const fx = equipped.fx && SHOP_BY_ID[equipped.fx] ? SHOP_BY_ID[equipped.fx].fx : null;
  const id = `bt${uid++}`;
  const hand = gear === 'gloves' ? '#B6FF2E' : SKIN;
  const handR = gear === 'gloves' ? 10 : 8;
  const armSvg = (side) => `<g class="b-arm b-arm-${side}">
      <rect x="-9" y="-4" width="18" height="58" rx="9" fill="${SKIN}"/>
      <rect x="-10" y="-6" width="20" height="24" rx="8" fill="${k.stripes && side === 'L' ? k.stripes : k.jersey}" stroke="${k.trim}" stroke-width="2"/>
      ${arm && side === 'R' ? (arm === 'captain' ? `<rect x="-11" y="6" width="22" height="10" rx="3" fill="#F2C14E"/><text x="0" y="15" text-anchor="middle" font-size="10" font-family="Jua" fill="#1B1B2A">C</text>` : `<g><rect x="-11" y="6" width="22" height="10" rx="3" fill="#FF4F4F"/><rect x="-11" y="9" width="22" height="2" fill="#FFE14D"/><rect x="-11" y="11" width="22" height="2" fill="#4FD18B"/><rect x="-11" y="13" width="22" height="3" fill="#4F8BFF"/></g>`) : ''}
      ${gear === 'wrist' ? `<rect x="-10" y="40" width="20" height="8" rx="3" fill="#FFFFFF" stroke="#2BB5A8" stroke-width="2"/>` : ''}
      <circle cx="0" cy="56" r="${handR}" fill="${hand}"/>
    </g>`;
  const eyes = `<g class="b-eyes-open"><ellipse cx="86" cy="66" rx="5" ry="6.5" fill="#1B1B2A"/><ellipse cx="114" cy="66" rx="5" ry="6.5" fill="#1B1B2A"/><circle cx="88" cy="64" r="1.8" fill="#fff"/><circle cx="116" cy="64" r="1.8" fill="#fff"/></g>
    <g class="b-eyes-shut"><path d="M80 67 Q86 71 92 67 M108 67 Q114 71 120 67" stroke="#1B1B2A" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  const mouth = `<path class="b-smile" d="M90 82 Q100 90 110 82" stroke="#8A3B2A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse class="b-yell" cx="100" cy="86" rx="8" ry="9" fill="#8A3B2A"/><circle class="b-oo" cx="100" cy="85" r="4" fill="#8A3B2A"/>`;
  const stripes = k.stripes ? `<g clip-path="url(#${id}c)">${[72, 92, 112, 132].map((x) => `<rect x="${x - 4}" y="96" width="10" height="80" fill="${k.stripes}"/>`).join('')}</g>` : '';
  const collar = k.retro ? `<path d="M88 100 L100 116 L112 100" stroke="${k.trim}" stroke-width="5" fill="none" stroke-linejoin="round"/>` : `<path d="M86 99 Q100 110 114 99" stroke="${k.trim}" stroke-width="5" fill="none"/>`;
  const leg = (x) => `<rect x="${x - 9}" y="196" width="18" height="14" fill="${SKIN}"/>
    <rect x="${x - 10}" y="208" width="20" height="30" rx="4" fill="${k.socks}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>
    <rect x="${x - 10}" y="210" width="20" height="4" fill="${k.trim}"/>
    <path d="M${x - 12} 236 h22 q10 0 12 8 q0 6 -6 6 h-28 q-4 0 -4 -6z" fill="${boot}" stroke="#1B1B2A" stroke-width="2"/>`;
  const headGear = gear === 'headband' ? `<rect x="61" y="42" width="78" height="9" rx="4" fill="#FFFFFF" stroke="#2BB5A8" stroke-width="2"/>` : '';
  const face = gear === 'paint' ? `<path d="M78 74 h10 M78 78 h10 M112 74 h10 M112 78 h10" stroke="#E2231A" stroke-width="2.5"/>` : gear === 'shades' ? `<g class="b-shades"><rect x="74" y="58" width="24" height="14" rx="5" fill="#1B1B2A"/><rect x="102" y="58" width="24" height="14" rx="5" fill="#1B1B2A"/><rect x="96" y="62" width="8" height="3" fill="#1B1B2A"/><path d="M78 61 l6 0" stroke="#fff" stroke-width="2"/></g>` : '';
  return `<svg class="ballon ${cls}" viewBox="0 0 200 260" width="${size}" height="${Math.round(size * 1.3)}" aria-hidden="true">
    <defs><clipPath id="${id}c"><path d="M64 100 Q100 92 136 100 L134 172 L66 172Z"/></clipPath></defs>
    <g class="b-fx">${fxSvg(fx)}</g>
    <g class="b-body">
      <g class="b-legs">${leg(84)}${leg(116)}</g>
      <path d="M66 166 h68 l4 34 h-34 l-4 -14 l-4 14 h-34z" fill="${k.shorts}" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>
      <g transform="translate(64 106)">${armSvg('L')}</g>
      <g transform="translate(136 106)">${armSvg('R')}</g>
      <path d="M64 100 Q100 92 136 100 L134 172 L66 172Z" fill="${k.jersey}" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
      ${stripes}${collar}
      ${k.num ? `<text x="100" y="152" text-anchor="middle" font-family="Jua" font-size="34" fill="${k.numC}" stroke="${k.stripes ? '#FFFFFF' : 'none'}" stroke-width="${k.stripes ? 1.5 : 0}">${k.num}</text>` : `<circle cx="100" cy="136" r="9" fill="${k.trim}"/><circle cx="100" cy="136" r="4" fill="${k.jersey}"/>`}
      ${hairBack}
      <rect x="92" y="94" width="16" height="10" fill="${SKIN_D}"/>
      <circle cx="100" cy="64" r="38" fill="${SKIN}"/>
      <ellipse cx="62" cy="68" rx="6" ry="9" fill="${SKIN}"/><ellipse cx="138" cy="68" rx="6" ry="9" fill="${SKIN}"/>
      <circle cx="78" cy="78" r="6" fill="#FF9AA2" opacity=".45"/><circle cx="122" cy="78" r="6" fill="#FF9AA2" opacity=".45"/>
      ${eyes}${mouth}${face}${hairFront}${headGear}
      <g class="b-camera"><rect x="70" y="52" width="60" height="30" rx="4" fill="none" stroke="${hand}" stroke-width="7" stroke-dasharray="20 20"/></g>
    </g>
    ${ballSvg(ball, 160, 238, 16)}
  </svg>`;
}

// play the equipped celebration on a rendered Ballon
export function celebrate(svgEl, cel) {
  if (!svgEl) return;
  const c = cel || 'fist';
  svgEl.classList.remove(...[...svgEl.classList].filter((x) => x.startsWith('cel-')));
  void svgEl.getBoundingClientRect();
  svgEl.classList.add(`cel-${c}`);
  clearTimeout(svgEl._celT);
  svgEl._celT = setTimeout(() => svgEl.classList.remove(`cel-${c}`), (CEL_SECONDS[c] || 2) * 1000);
}

// small icon for shop cards that aren't worn (celebrations)
export const CEL_ICON = { fist: '✊', siuuu: '🌀', camera: '📸', zen: '🧘', airplane: '✈️', slide: '🛝', backflip: '🤸', samba: '💃', shush: '🤫' };
