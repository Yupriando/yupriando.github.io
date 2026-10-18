/*
 * Bentuk-bentuk karang & makhluk dasar laut (SVG).
 * Semua digambar dengan dasar di titik (0,0) dan tumbuh ke atas (y negatif).
 * Bentuk acak dibuat dari "seed" supaya hasilnya selalu sama tiap kali dimuat.
 */
import { useMemo } from 'react';

export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = (r, a, b) => a + r() * (b - a);
const f1 = (n) => Math.round(n * 10) / 10;

/* Karang bercabang (staghorn) / karang bambu (deep) */
export function Branching({ seed, color, tip, nodes = false }) {
  const segs = useMemo(() => {
    const r = mulberry32(seed);
    const out = [];
    const grow = (x, y, ang, len, d) => {
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      out.push({ x1: f1(x), y1: f1(y), x2: f1(x2), y2: f1(y2), w: d * 2.4 + 1.4, d });
      if (d <= 0) return;
      const n = r() < 0.25 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const spread = (i - (n - 1) / 2) * R(r, 0.4, 0.65) + R(r, -0.15, 0.15);
        grow(x2, y2, ang + spread, len * R(r, 0.62, 0.8), d - 1);
      }
    };
    grow(0, 0, -Math.PI / 2 + R(r, -0.2, 0.2), R(r, 22, 30), r() < 0.5 ? 3 : 4);
    return out;
  }, [seed]);
  return (
    <g strokeLinecap="round">
      {segs.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={color} strokeWidth={nodes ? Math.max(1.2, s.w * 0.45) : s.w} />
      ))}
      {segs
        .filter((s) => nodes || s.d === 0)
        .map((s, i) => (
          <circle key={`t${i}`} cx={s.x2} cy={s.y2} r={nodes ? 1.8 : 2.4} fill={tip} className={nodes ? 'bio' : undefined} />
        ))}
    </g>
  );
}

/* Kipas laut (gorgonian) */
export function Fan({ seed, color }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const n = 13;
    const rays = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (0.92 - (i / (n - 1)) * 0.84);
      const len = R(r, 48, 70);
      const tip = [Math.cos(a) * len, Math.sin(a) * len];
      const c = [Math.cos(a) * len * 0.5 + R(r, -4, 4), Math.sin(a) * len * 0.5];
      rays.push({ tip, c });
    }
    const at = (ray, t) => [2 * (1 - t) * t * ray.c[0] + t * t * ray.tip[0], 2 * (1 - t) * t * ray.c[1] + t * t * ray.tip[1]];
    const mesh = [0.35, 0.6, 0.85].map((t) => rays.map((ray) => at(ray, t).map(f1).join(',')).join(' '));
    const outline = `M0 0 ${rays.map((ray) => `L${f1(ray.tip[0])} ${f1(ray.tip[1])}`).join(' ')} Z`;
    return { rays, mesh, outline };
  }, [seed]);
  return (
    <g className="sway-slow" fill="none" stroke={color} strokeLinecap="round">
      <path d={g.outline} fill={color} opacity=".22" stroke="none" />
      {g.rays.map((ray, i) => (
        <path key={i} d={`M0 0 Q${f1(ray.c[0])} ${f1(ray.c[1])} ${f1(ray.tip[0])} ${f1(ray.tip[1])}`} strokeWidth="1.7" />
      ))}
      {g.mesh.map((pts, i) => (
        <polyline key={`m${i}`} points={pts} strokeWidth=".9" opacity=".8" />
      ))}
      <line x1="0" y1="0" x2="0" y2="-6" strokeWidth="4" />
    </g>
  );
}

/* Karang otak */
export function Brain({ seed, uid, color, dark }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const rx = R(r, 22, 32);
    const ry = rx * R(r, 0.65, 0.8);
    const dome = `M${f1(-rx)} 0 A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(rx)} 0 Z`;
    const grooves = [];
    for (let y = -ry + 3; y < -1; y += 4.2) {
      const ph = R(r, 0, 6);
      let d = '';
      for (let x = -rx; x <= rx; x += 2) d += `${d ? 'L' : 'M'}${f1(x)} ${f1(y + Math.sin(x / 2.2 + ph) * 1.8)}`;
      grooves.push(d);
    }
    return { dome, grooves };
  }, [seed]);
  const id = `brain-${uid}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={g.dome} />
        </clipPath>
      </defs>
      <path d={g.dome} fill={color} />
      <g clipPath={`url(#${id})`} stroke={dark} strokeWidth="1.3" fill="none" opacity=".7">
        {g.grooves.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

/* Karang pipa */
export function Tubes({ seed, color, dark }) {
  const tubes = useMemo(() => {
    const r = mulberry32(seed);
    const n = 4 + ((r() * 4) | 0);
    return Array.from({ length: n }, () => ({ x: R(r, -16, 16), h: R(r, 22, 52), w: R(r, 6, 9), tilt: R(r, -10, 10) })).sort(
      (a, b) => b.h - a.h
    );
  }, [seed]);
  return (
    <g>
      {tubes.map((t, i) => (
        <g key={i} transform={`translate(${f1(t.x)} 0) rotate(${f1(t.tilt)})`}>
          <rect x={-t.w / 2} y={-t.h} width={t.w} height={t.h} rx={t.w / 2} fill={color} />
          <ellipse cx="0" cy={-t.h + 1} rx={t.w / 2 - 0.5} ry={t.w / 4} fill={dark} />
        </g>
      ))}
    </g>
  );
}

/* Karang meja */
export function Table({ color, light }) {
  return (
    <g>
      <rect x="-4" y="-30" width="8" height="30" rx="3" fill={color} />
      <ellipse cx="0" cy="-30" rx="36" ry="6.5" fill={color} />
      <ellipse cx="0" cy="-32.5" rx="30" ry="4" fill={light} opacity=".55" />
      <ellipse cx="4" cy="-40" rx="22" ry="4.5" fill={color} />
      <ellipse cx="4" cy="-42" rx="17" ry="2.6" fill={light} opacity=".55" />
      {[-30, -20, -10, 0, 10, 20, 30].map((x) => (
        <circle key={x} cx={x} cy="-27" r="1.2" fill={light} />
      ))}
    </g>
  );
}

/* Anemon (bisa ada ikan badut yang bersembunyi) */
export function Anemone({ seed, color, tip, base, nemo }) {
  const tents = useMemo(() => {
    const r = mulberry32(seed);
    const n = 16 + ((r() * 7) | 0);
    return Array.from({ length: n }, (_, i) => {
      const bx = -13 + (26 * i) / (n - 1);
      return {
        bx: f1(bx),
        cx: f1(bx * 1.25 + R(r, -3, 3)),
        cy: f1(-R(r, 14, 22)),
        tx: f1(bx * 1.9 + R(r, -6, 6)),
        ty: f1(-R(r, 26, 40)),
      };
    });
  }, [seed]);
  return (
    <g>
      <g className="anemone-sway" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round">
        {tents.map((t, i) => (
          <path key={i} d={`M${t.bx} -8 Q${t.cx} ${t.cy} ${t.tx} ${t.ty}`} />
        ))}
        {tents.map((t, i) => (
          <circle key={`t${i}`} cx={t.tx} cy={t.ty} r="2.3" fill={tip} stroke="none" />
        ))}
      </g>
      <path d="M-14 0 Q-16 -6 -12 -10 L12 -10 Q16 -6 14 0 Z" fill={base} />
      {nemo && (
        <g transform="translate(0 -26)">
        <g className="nemo">
          <g className="nemo-body">
            <path d="M-7 0 l-5 -4 v8z" fill="#ff7a2f" />
            <ellipse rx="8" ry="4.6" fill="#ff7a2f" />
            <rect x="-2" y="-4.6" width="2.4" height="9.2" fill="#fff" />
            <rect x="3.6" y="-4" width="1.8" height="8" fill="#fff" />
            <circle cx="5.6" cy="-1.2" r="1.1" fill="#111" />
          </g>
        </g>
        </g>
      )}
    </g>
  );
}

/* Bintang laut */
export function Star({ seed, color }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const rot = R(r, 0, 72);
    const pts = Array.from({ length: 10 }, (_, i) => {
      const rad = i % 2 ? 5 : 13;
      const a = ((-90 + i * 36 + rot) * Math.PI) / 180;
      return `${f1(Math.cos(a) * rad)},${f1(Math.sin(a) * rad * 0.6 - 6)}`;
    }).join(' ');
    return pts;
  }, [seed]);
  return <polygon points={g} fill={color} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />;
}

/* Kerang */
export function Shell({ color, dark }) {
  return (
    <g>
      <path d="M0 0 L-12 -4 Q-14 -17 0 -20 Q14 -17 12 -4 Z" fill={color} />
      {[-10, -5, 0, 5, 10].map((x) => (
        <line key={x} x1="0" y1="-1" x2={x} y2={-17 + Math.abs(x) * 0.25} stroke={dark} strokeWidth="1" opacity=".55" />
      ))}
      <rect x="-3" y="-2" width="6" height="3" rx="1" fill={dark} />
    </g>
  );
}

/* Rumput laut / kelp */
export function Kelp({ seed, color, leaf }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const h = R(r, 110, 170);
    const ph = R(r, 0, 6);
    let d = 'M0 0';
    const leaves = [];
    for (let y = 20, i = 0; y <= h; y += 20, i++) {
      const x = Math.sin(i * 0.9 + ph) * 6;
      d += ` Q${f1(x * 1.6)} ${f1(-y + 10)} ${f1(x)} ${f1(-y)}`;
      if (i % 1 === 0 && y < h - 10) leaves.push({ x: f1(x), y: f1(-y), side: i % 2 ? 1 : -1, len: R(r, 8, 13) });
    }
    return { d, leaves };
  }, [seed]);
  return (
    <g className="kelp-sway">
      <path d={g.d} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {g.leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x + l.side * l.len * 0.6}
          cy={l.y}
          rx={l.len}
          ry="3"
          fill={leaf}
          transform={`rotate(${l.side * -25} ${l.x} ${l.y})`}
        />
      ))}
    </g>
  );
}

/* Spons laut (tabung/vas) */
export function Sponge({ seed, color, dark }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const n = r() < 0.45 ? 2 : 1;
    return Array.from({ length: n }, (_, i) => {
      const h = R(r, 38, 62) * (i ? 0.7 : 1);
      const w = R(r, 9, 14);
      const ox = i ? R(r, 12, 18) : 0;
      return {
        ox,
        h,
        w,
        d: `M${f1(-w)} 0 C${f1(-w - 4)} ${f1(-h * 0.4)} ${f1(-w - 6)} ${f1(-h * 0.8)} ${f1(-w + 2)} ${f1(-h)} L${f1(w - 2)} ${f1(-h)} C${f1(w + 6)} ${f1(-h * 0.8)} ${f1(w + 4)} ${f1(-h * 0.4)} ${f1(w)} 0 Z`,
        pores: Array.from({ length: 6 }, () => [f1(R(r, -w + 3, w - 3)), f1(-R(r, 6, h - 6))]),
      };
    }).reverse();
  }, [seed]);
  return (
    <g>
      {g.map((s, i) => (
        <g key={i} transform={`translate(${s.ox} 0)`}>
          <path d={s.d} fill={color} />
          <ellipse cx="0" cy={-s.h} rx={s.w - 2} ry="3.2" fill={dark} />
          {s.pores.map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r="1.4" fill={dark} opacity=".5" />
          ))}
        </g>
      ))}
    </g>
  );
}

/* Karang lunak / gelembung */
export function Polyps({ seed, color, light }) {
  const dots = useMemo(() => {
    const r = mulberry32(seed);
    const n = 9 + ((r() * 7) | 0);
    return Array.from({ length: n }, () => {
      const a = R(r, Math.PI * 1.05, Math.PI * 1.95);
      const d = R(r, 0, 18);
      return { x: f1(Math.cos(a) * d * 1.2), y: f1(Math.sin(a) * d - 5), r: f1(R(r, 3.5, 7)) };
    }).sort((a, b) => a.y - b.y);
  }, [seed]);
  return (
    <g>
      {dots.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={p.r} fill={color} />
          <circle cx={p.x - p.r * 0.3} cy={p.y - p.r * 0.3} r={p.r * 0.35} fill={light} opacity=".7" />
        </g>
      ))}
    </g>
  );
}

/* Bulu babi */
export function Urchin({ seed }) {
  const spikes = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: 24 }, (_, i) => {
      const a = Math.PI + (i / 23) * Math.PI + R(r, -0.08, 0.08);
      const len = R(r, 13, 19);
      return [f1(Math.cos(a) * 5), f1(Math.sin(a) * 5 - 6), f1(Math.cos(a) * len), f1(Math.sin(a) * len - 6)];
    });
  }, [seed]);
  return (
    <g>
      {spikes.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2b1a3a" strokeWidth="1.4" strokeLinecap="round" />
      ))}
      <circle cx="0" cy="-6" r="7" fill="#4a2c5e" />
      <circle cx="-2" cy="-8" r="2" fill="#7b5a8e" />
    </g>
  );
}

/* ------------------------- laut dalam ------------------------- */

/* Pena laut (bercahaya) */
export function SeaPen({ seed, color }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const h = R(r, 40, 62);
    const leaves = [];
    for (let y = h * 0.3; y < h; y += 4) {
      const len = 9 * Math.sin(((y - h * 0.3) / (h * 0.7)) * Math.PI) + 2;
      leaves.push([f1(-y), f1(len)]);
    }
    return { h: f1(h), leaves };
  }, [seed]);
  return (
    <g className="glow-soft" stroke={color} strokeLinecap="round" style={{ color }}>
      <line x1="0" y1="0" x2="0" y2={-g.h} strokeWidth="2" />
      {g.leaves.map(([y, len], i) => (
        <g key={i} strokeWidth="1.2" opacity=".85">
          <line x1="0" y1={y} x2={-len} y2={y - 4} />
          <line x1="0" y1={y} x2={len} y2={y - 4} />
        </g>
      ))}
    </g>
  );
}

/* Cacing tabung (di sekitar ventilasi hidrotermal) */
export function TubeWorms({ seed }) {
  const worms = useMemo(() => {
    const r = mulberry32(seed);
    const n = 5 + ((r() * 5) | 0);
    return Array.from({ length: n }, () => {
      const x = R(r, -16, 16);
      const h = R(r, 25, 62);
      const bend = R(r, -8, 8);
      return { x: f1(x), h: f1(h), d: `M${f1(x)} 0 Q${f1(x + bend)} ${f1(-h / 2)} ${f1(x + bend * 0.4)} ${f1(-h)}`, tx: f1(x + bend * 0.4), delay: R(r, 0, 2) };
    });
  }, [seed]);
  return (
    <g>
      {worms.map((w, i) => (
        <g key={i}>
          <path d={w.d} stroke="#e9e4d8" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <g className="plume" style={{ animationDelay: `${w.delay}s` }}>
            <ellipse cx={w.tx} cy={-w.h - 4} rx="4.2" ry="6" fill="#e63946" />
            <ellipse cx={w.tx} cy={-w.h - 5} rx="2.2" ry="4" fill="#ff6b6b" />
          </g>
        </g>
      ))}
    </g>
  );
}

/* Ventilasi hidrotermal (cerobong berasap) */
export function Vent() {
  return (
    <g>
      <path d="M-18 0 L-13 -28 L-16 -46 L-9 -70 L9 -70 L13 -48 L11 -26 L18 0 Z" fill="#2a2230" />
      <path d="M-13 -28 L-4 -30 M5 -48 L13 -48 M-9 -55 L-2 -56" stroke="#3d3346" strokeWidth="2" />
      <ellipse cx="0" cy="-70" rx="9" ry="3" fill="#ff8c42" className="bio" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className="smoke" cx="0" cy="-74" r={6 + i} fill="#5c5466" style={{ animationDelay: `${i * 0.9}s` }} />
      ))}
    </g>
  );
}

/* Spons kaca (transparan bercahaya) */
export function GlassSponge({ seed, color }) {
  const g = useMemo(() => {
    const r = mulberry32(seed);
    const h = R(r, 45, 70);
    const w = R(r, 10, 14);
    return { h: f1(h), w: f1(w) };
  }, [seed]);
  const { h, w } = g;
  const d = `M${-w * 0.5} 0 C${-w * 1.3} ${-h * 0.4} ${-w * 1.2} ${-h * 0.8} ${-w} ${-h} L${w} ${-h} C${w * 1.2} ${-h * 0.8} ${w * 1.3} ${-h * 0.4} ${w * 0.5} 0 Z`;
  return (
    <g className="glow-soft" style={{ color }}>
      <path d={d} fill={color} fillOpacity=".12" stroke={color} strokeOpacity=".7" strokeWidth="1.3" />
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={-w * (0.6 + t * 0.4)} y1={-h * t} x2={w * (0.6 + t * 0.4)} y2={-h * t} stroke={color} strokeOpacity=".4" strokeWidth=".8" />
      ))}
      {[-0.5, 0, 0.5].map((t) => (
        <line key={`v${t}`} x1={w * t * 0.5} y1="0" x2={w * t} y2={-h} stroke={color} strokeOpacity=".4" strokeWidth=".8" />
      ))}
      <ellipse cx="0" cy={-h} rx={w} ry="2.5" fill="none" stroke={color} strokeOpacity=".8" />
    </g>
  );
}

/* Bintang ular laut */
export function Brittle({ seed, color }) {
  const arms = useMemo(() => {
    const r = mulberry32(seed);
    const rot = R(r, 0, 72);
    return Array.from({ length: 5 }, (_, i) => {
      const a = ((rot + i * 72) * Math.PI) / 180;
      const len = R(r, 16, 24);
      const ex = Math.cos(a) * len, ey = Math.sin(a) * len * 0.45 - 3;
      const cx = Math.cos(a + 0.5) * len * 0.6, cy = Math.sin(a + 0.5) * len * 0.3 - 3;
      return `M0 -3 Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}`;
    });
  }, [seed]);
  return (
    <g stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round">
      {arms.map((d, i) => (
        <path key={i} d={d} />
      ))}
      <circle cx="0" cy="-3" r="3.5" fill={color} stroke="none" />
    </g>
  );
}
