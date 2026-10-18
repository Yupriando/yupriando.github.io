/*
 * Terumbu karang prosedural. Ada 4 gaya sesuai kedalaman:
 *  shallow  — karang warna-warni, anemon + ikan badut
 *  twilight — kipas laut & spons ungu-merah
 *  midnight — pena laut & spons kaca yang bercahaya
 *  abyss    — ventilasi hidrotermal & cacing tabung (dipakai di dasar laut)
 *
 * Klik karang → karang bergoyang & mengeluarkan gelembung.
 */
import { useMemo } from 'react';
import {
  mulberry32, Branching, Fan, Brain, Tubes, Table, Anemone, Star, Shell, Kelp, Sponge, Polyps, Urchin,
  SeaPen, TubeWorms, Vent, GlassSponge, Brittle,
} from './corals';
import { assets } from '../assets';
import { assetUrl } from '../ocean/images';
import '../styles/reef.css';

const R = (r, a, b) => a + r() * (b - a);
const pick = (r, arr) => arr[(r() * arr.length) | 0];
const f1 = (n) => Math.round(n * 10) / 10;

const VARIANTS = {
  shallow: {
    rock: ['#2b7d94', '#114a6b'],
    rockFront: ['#22708a', '#0c3c5c'],
    back: ['kelp', 'kelp', 'fan', 'branching', 'branching', 'tubes', 'sponge', 'table', 'polyps', 'brain'],
    front: ['branching', 'branching', 'brain', 'brain', 'anemone', 'anemone', 'polyps', 'polyps', 'tubes', 'star', 'shell', 'urchin', 'sponge', 'table', 'fan'],
    corals: ['#ff6f91', '#ff9671', '#ffc75f', '#c34a9c', '#00c9a7', '#ff8c42', '#a77bca', '#e84a5f', '#4ecdc4', '#f9f871'],
    nemo: 0.6,
  },
  twilight: {
    rock: ['#1d4b78', '#0c2a4d'],
    rockFront: ['#173f68', '#0a2343'],
    back: ['fan', 'fan', 'kelp', 'sponge', 'branching', 'tubes', 'polyps'],
    front: ['fan', 'fan', 'sponge', 'polyps', 'brain', 'urchin', 'star', 'anemone', 'branching', 'tubes', 'shell'],
    corals: ['#b5179e', '#7209b7', '#f72585', '#e85d04', '#9d4edd', '#c77dff', '#e5383b', '#ff9e00'],
    nemo: 0,
  },
  midnight: {
    rock: ['#0d2445', '#050f22'],
    rockFront: ['#0a1d3a', '#040b1a'],
    back: ['seapen', 'bamboo', 'glass', 'glass', 'seapen', 'polyps'],
    front: ['seapen', 'seapen', 'bamboo', 'glass', 'anemone', 'brittle', 'polyps', 'brittle'],
    corals: ['#7bf3ff', '#ff7bd5', '#b388ff', '#64ffda', '#82b1ff'],
    nemo: 0,
  },
  abyss: {
    back: ['vent', 'glass', 'bamboo', 'seapen', 'tubeworms'],
    front: ['tubeworms', 'tubeworms', 'brittle', 'anemone', 'glass', 'seapen', 'star'],
    corals: ['#7bf3ff', '#ff7bd5', '#b388ff', '#64ffda', '#ff9e7a'],
    nemo: 0,
  },
};

// gambar karang sendiri yang berlaku untuk zona ini
function customCorals(variant) {
  return (assets.coral?.items || []).filter((it) => it?.src && (it.zones || ['shallow']).includes(variant));
}

function renderShape(it, uid, pal) {
  if (it.type === 'image') {
    const w = it.img.width || 70;
    const h = it.img.height || w;
    return <image href={assetUrl(it.img.src)} x={-w / 2} y={-h} width={w} height={h} preserveAspectRatio="xMidYMax meet" />;
  }
  const r = mulberry32(it.seed);
  const c1 = pick(r, pal.corals);
  const c2 = pick(r, pal.corals);
  const deep = pal === VARIANTS.midnight || pal === VARIANTS.abyss;
  switch (it.type) {
    case 'branching':
      return <Branching seed={it.seed} color={c1} tip={c2} />;
    case 'bamboo':
      return <Branching seed={it.seed} color="#e9ecef" tip={c1} nodes />;
    case 'fan':
      return <Fan seed={it.seed} color={c1} />;
    case 'brain':
      return <Brain seed={it.seed} uid={uid} color={pick(r, ['#c9b458', '#9bc53d', '#e8a87c', '#b8a1d9', '#f4a261'])} dark="rgba(60,30,20,.55)" />;
    case 'tubes':
      return <Tubes seed={it.seed} color={c1} dark="rgba(40,10,30,.6)" />;
    case 'table':
      return <Table color={pick(r, ['#7fb069', '#e6aa68', '#b5838d', '#6d9dc5'])} light="#fff3c4" />;
    case 'anemone':
      return deep ? (
        <g className="glow-soft" style={{ color: c1 }}>
          <Anemone seed={it.seed} color={c1} tip="#ffffff" base="#2a1d3d" />
        </g>
      ) : (
        <Anemone
          seed={it.seed}
          color={pick(r, ['#ff9ecf', '#b5f2ff', '#ffd6a5', '#caffbf', '#ffadad'])}
          tip="#ff70a6"
          base="#7a3b69"
          nemo={r() < pal.nemo}
        />
      );
    case 'kelp':
      return <Kelp seed={it.seed} color="#2d6a4f" leaf={pick(r, ['#52b788', '#74c69d', '#40916c'])} />;
    case 'sponge':
      return <Sponge seed={it.seed} color={pick(r, ['#ffb703', '#fb8500', '#9d4edd', '#ef476f', '#e85d04'])} dark="rgba(60,20,20,.55)" />;
    case 'polyps':
      return deep ? (
        <g className="glow-soft" style={{ color: c1 }}>
          <Polyps seed={it.seed} color={c1} light="#ffffff" />
        </g>
      ) : (
        <Polyps seed={it.seed} color={c1} light="#ffffff" />
      );
    case 'star':
      return <Star seed={it.seed} color={pick(r, ['#ff7b54', '#ef476f', '#ffd166', '#9b5de5', '#f15bb5'])} />;
    case 'shell':
      return <Shell color={pick(r, ['#ffe5d9', '#fcd5ce', '#f8edeb'])} dark="#c08a6a" />;
    case 'urchin':
      return <Urchin seed={it.seed} />;
    case 'seapen':
      return <SeaPen seed={it.seed} color={c1} />;
    case 'glass':
      return <GlassSponge seed={it.seed} color={c1} />;
    case 'brittle':
      return <Brittle seed={it.seed} color={deep ? c1 : '#f4a261'} />;
    case 'tubeworms':
      return <TubeWorms seed={it.seed} />;
    case 'vent':
      return <Vent />;
    default:
      return null;
  }
}

/* Satu baris karang di sepanjang garis kontur */
export function ReefItems({ variant, seed, uid, contour, step = [32, 64], scale = [0.8, 1.2], back = false, x0 = -10, x1 = 1450 }) {
  const pal = VARIANTS[variant];
  const items = useMemo(() => {
    const r = mulberry32(seed);
    // karang bawaan + gambar karang sendiri (src/assets.js)
    const custom = customCorals(variant);
    const replace = assets.coral?.replaceDefault && custom.length > 0;
    const pool = [
      ...(replace ? [] : back ? pal.back : pal.front),
      ...custom.flatMap((img) => Array(Math.max(1, Math.round(img.chance || 2))).fill({ img })),
    ];
    const out = [];
    let hasVent = false;
    for (let x = x0 + R(r, 0, step[0]); x < x1; x += R(r, step[0], step[1])) {
      const entry = pick(r, pool);
      let type = typeof entry === 'string' ? entry : 'image';
      if (type === 'vent') {
        if (hasVent) type = 'tubeworms';
        hasVent = true;
      }
      const flip = r() < 0.5;
      out.push({
        type,
        img: entry.img,
        x: f1(x),
        y: f1(contour(x) + (back ? 6 : 3)),
        s: R(r, scale[0], scale[1]),
        flip: entry.img?.flip === false ? false : flip,
        seed: (r() * 1e9) | 0,
      });
    }
    return out;
    // contour dianggap tetap untuk seed yang sama
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, seed, back]);

  return (
    <g className={back ? 'reef-back' : 'reef-front'}>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${it.x} ${it.y}) scale(${f1((it.flip ? -1 : 1) * it.s * 100) / 100} ${f1(it.s * 100) / 100})`}>
          <g className={`reef-item reef-${it.type}`}>{renderShape(it, `${uid}-${back ? 'b' : 'f'}${i}`, pal)}</g>
        </g>
      ))}
    </g>
  );
}

/* Klik karang: goyang + gelembung (diteruskan ke kanvas laut) */
export function handleReefClick(e) {
  const item = e.target.closest?.('.reef-item');
  if (!item || document.documentElement.dataset.justDragged) return;
  window.dispatchEvent(new CustomEvent('ocean:bubbles', { detail: { x: e.clientX, y: e.clientY } }));
  item.classList.remove('poked');
  void item.getBoundingClientRect();
  item.classList.add('poked');
  setTimeout(() => item.classList.remove('poked'), 750);
  if (item.classList.contains('reef-anemone')) {
    item.classList.add('hiding');
    setTimeout(() => item.classList.remove('hiding'), 2600);
  }
}

const rockPath = (fn) => {
  let d = 'M0 300';
  for (let x = 0; x <= 1440; x += 20) d += ` L${x} ${f1(fn(x))}`;
  return `${d} L1440 300 Z`;
};

export default function Reef({ variant = 'shallow', seed = 1, className = '' }) {
  const v = VARIANTS[variant];
  const geo = useMemo(() => {
    const backY = (x) => 205 + 16 * Math.sin(x / 150 + seed) + 9 * Math.sin(x / 53 + seed * 2);
    const frontY = (x) => 258 + 10 * Math.sin(x / 120 + seed * 0.7) + 6 * Math.sin(x / 41 + seed);
    return { backY, frontY, back: rockPath(backY), front: rockPath(frontY) };
  }, [seed]);
  const id = `${variant}-${seed}`;

  return (
    <div className={`reef reef-${variant} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice" onClick={handleReefClick}>
        <defs>
          <linearGradient id={`rock-b-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={v.rock[0]} />
            <stop offset="1" stopColor={v.rock[1]} />
          </linearGradient>
          <linearGradient id={`rock-f-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={v.rockFront[0]} />
            <stop offset="1" stopColor={v.rockFront[1]} />
          </linearGradient>
        </defs>
        <path d={geo.back} fill={`url(#rock-b-${id})`} opacity=".7" />
        <ReefItems variant={variant} seed={seed * 31} uid={id} contour={geo.backY} step={[30, 62]} scale={[0.5, 0.8]} back />
        <path d={geo.front} fill={`url(#rock-f-${id})`} />
        <ReefItems variant={variant} seed={seed * 97} uid={id} contour={geo.frontY} step={[34, 70]} scale={[0.75, 1.2]} />
      </svg>
    </div>
  );
}
