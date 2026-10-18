import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { boatLines } from '../data';
import { assets } from '../assets';
import { assetUrl } from '../ocean/images';

/* Kapal dari gambar sendiri (src/assets.js → boat) */
function CustomBoat({ bent, onRatio, onError }) {
  const b = assets.boat;
  const tip = bent && b.rodTipBent ? b.rodTipBent : b.rodTip || [0.08, 0.1];
  const bucket = b.bucket || [0.55, 0.6];
  const pos = ([x, y]) => ({ left: `${x * 100}%`, top: `${y * 100}%` });
  return (
    <div className="boat boat-custom">
      <img
        src={assetUrl(b.src)}
        alt=""
        draggable={false}
        onLoad={(e) => onRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
        onError={onError}
      />
      {/* titik bantu: ujung joran (untuk tali pancing) & ember (tujuan ikan hasil pancingan) */}
      <span id="rod-tip" className="boat-anchor" style={pos(tip)} />
      <span id="boat-bucket" className="boat-anchor" style={pos(bucket)} />
    </div>
  );
}

// Geometri joran: lurus vs melengkung saat ada ikan nyangkut
const ROD = {
  idle: { d: 'M106 146 Q70 88 34 28', tip: [34, 28] },
  bent: { d: 'M106 146 Q64 70 26 74', tip: [26, 74] },
};

/*
 * Kapal dengan pemancing yang ngoding.
 *  - Klik kapal → si pemancing nyeletuk
 *  - Bereaksi terhadap mini-game memancing (event "ocean:fishing" dari kanvas laut)
 *  - Titik #rod-tip dipakai kanvas untuk menggambar tali pancing
 */
export default function Boat({ style }) {
  const [line, setLine] = useState(null);
  const [bent, setBent] = useState(false);
  const [cheer, setCheer] = useState(false);
  const idx = useRef(0);
  const timer = useRef();

  const say = (text, ms = 3000) => {
    clearTimeout(timer.current);
    setLine({ id: Date.now() + Math.random(), text });
    timer.current = setTimeout(() => setLine(null), ms);
  };

  const talk = () => {
    say(boatLines[idx.current % boatLines.length]);
    idx.current++;
  };

  useEffect(() => {
    const onFishing = (e) => {
      const { type, name, msg } = e.detail;
      if (type === 'bite') {
        setBent(true);
        say('Strike!! Ada yang makan umpan! 🎣', 4000);
      } else if (type === 'reel') {
        say('Tarik teruuus!! 💪', 2500);
      } else if (type === 'catch') {
        setBent(false);
        setCheer(true);
        setTimeout(() => setCheer(false), 1400);
        say(`Yeay, dapat ${name}! 🎉`);
      } else if (type === 'bug') {
        setBent(false);
        say('Bug lagi?! Langsung di-fix deh 🐛✅');
      } else if (type === 'release') {
        setBent(false);
        say(msg);
      } else if (type === 'escape') {
        setBent(false);
        say(`Yah, ${name}-nya lepas… 😭`);
      }
    };
    window.addEventListener('ocean:fishing', onFishing);
    return () => {
      window.removeEventListener('ocean:fishing', onFishing);
      clearTimeout(timer.current);
    };
  }, []);

  const [ratio, setRatio] = useState(null);
  const [broken, setBroken] = useState(false);
  const custom = !!assets.boat?.src && !broken;
  const boatVars = {
    '--boat-scale': assets.boat?.scale || 1,
    ...(custom && ratio ? { '--boat-k': ratio * (assets.boat.waterline ?? 0.82) } : {}),
  };
  const onBoatError = () => {
    console.warn(`[aset] Gagal memuat kapal "${assets.boat.src}". Kapal bawaan dipakai.`);
    setBroken(true);
  };

  const rod = bent ? ROD.bent : ROD.idle;
  const rodTransition = { type: 'spring', stiffness: 160, damping: 12 };

  return (
    <motion.div
      className="boat-wrap"
      style={{ ...style, ...boatVars }}
      initial={{ x: '45vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 2.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence>
        {line && (
          <motion.div
            key={line.id}
            className="boat-bubble mono"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          >
            {line.text}
          </motion.div>
        )}
      </AnimatePresence>

      <button className={`boat-btn${cheer ? ' cheer' : ''}${bent ? ' fight' : ''}`} onClick={talk} aria-label="Ajak ngobrol si pemancing">
        {custom ? (
          <CustomBoat bent={bent} onRatio={setRatio} onError={onBoatError} />
        ) : (
        <svg className="boat" viewBox="0 0 320 230" overflow="visible" aria-hidden="true">
          <defs>
            <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ef6461" />
              <stop offset="1" stopColor="#a8323a" />
            </linearGradient>
            <linearGradient id="cabinGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fbf3e4" />
              <stop offset="1" stopColor="#e2d3b8" />
            </linearGradient>
            <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c9f2ff" />
              <stop offset="1" stopColor="#4fb3e0" />
            </linearGradient>
            <linearGradient id="hoodieGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4b8be0" />
              <stop offset="1" stopColor="#2f63b0" />
            </linearGradient>
            <radialGradient id="lampGlow">
              <stop offset="0" stopColor="#ffd166" stopOpacity=".8" />
              <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ---------- bendera ---------- */}
          <line x1="304" y1="166" x2="304" y2="100" stroke="#8b5a2b" strokeWidth="3" strokeLinecap="round" />
          <g className="flag">
            <path d="M305 102 C314 98 322 108 334 104 L334 122 C322 126 314 116 305 120 Z" fill="#5ce1e6" />
            <text x="311" y="115" className="flag-text">&lt;/&gt;</text>
          </g>

          {/* ---------- kabin ---------- */}
          <rect x="196" y="110" width="90" height="58" rx="5" fill="url(#cabinGrad)" />
          <path d="M186 110 L296 110 L289 95 Q241 88 193 95 Z" fill="#2a4d69" />
          <rect x="184" y="108" width="114" height="5" rx="2" fill="#1d3a52" />
          <rect x="206" y="122" width="22" height="18" rx="3" fill="url(#glassGrad)" />
          <rect x="236" y="122" width="22" height="18" rx="3" fill="url(#glassGrad)" />
          <path d="M209 137 L219 125 M239 137 L249 125" stroke="#fff" strokeWidth="2" opacity=".55" strokeLinecap="round" />
          <rect x="266" y="122" width="14" height="44" rx="2" fill="#c9b28f" />
          <circle cx="277" cy="145" r="1.4" fill="#6b4f2a" />
          {/* pelampung penyelamat */}
          <circle cx="232" cy="153" r="8" fill="none" stroke="#fff" strokeWidth="4" />
          <circle cx="232" cy="153" r="8" fill="none" stroke="#ff5c5c" strokeWidth="4" strokeDasharray="6.3 6.3" />
          {/* lentera */}
          <line x1="192" y1="110" x2="192" y2="117" stroke="#555" strokeWidth="1.2" />
          <circle className="lamp-glow" cx="192" cy="122" r="14" fill="url(#lampGlow)" />
          <rect x="188" y="117" width="8" height="10" rx="2" fill="#ffd166" stroke="#7a5c1e" strokeWidth="1" />
          {/* antena & wifi */}
          <line x1="280" y1="95" x2="280" y2="64" stroke="#d9d9d9" strokeWidth="3" />
          <circle cx="280" cy="62" r="3.5" fill="#ff5c5c" />
          <g className="wifi" fill="none" stroke="#5ce1e6" strokeWidth="2" strokeLinecap="round">
            <path className="a1" d="M273 55 a10 10 0 0 1 14 0" />
            <path className="a2" d="M268 49 a17 17 0 0 1 24 0" />
            <path className="a3" d="M263 43 a24 24 0 0 1 34 0" />
          </g>

          {/* ---------- kucing tidur di atap ---------- */}
          <g className="cat">
            <path className="cat-tail" d="M214 92 q-11 1 -9 -9" stroke="#f4a261" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <ellipse cx="226" cy="90" rx="13" ry="6.5" fill="#f4a261" />
            <path d="M220 85 q2 4 0 9 M226 84 q2 4 0 10" stroke="#e07a3f" strokeWidth="1.6" fill="none" />
            <circle cx="239" cy="88" r="6" fill="#f4a261" />
            <path d="M235 84 L236.5 78 L240 83 Z M240 83 L243.5 78 L244.5 85 Z" fill="#f4a261" />
            <path d="M236 88 q1.2 1 2.4 0 M240.5 88 q1.2 1 2.4 0" stroke="#5a3a1f" strokeWidth=".9" fill="none" />
            <text className="zzz" x="246" y="80">z</text>
            <text className="zzz z2" x="251" y="73">z</text>
          </g>

          {/* ---------- perlengkapan di dek ---------- */}
          {/* ember berisi hasil tangkapan */}
          <path d="M166 164 l3 -6 l4 4 z" fill="#ff7a2f" />
          <path d="M160 150 H180 L177 168 H163 Z" fill="#9aa5b1" />
          <ellipse cx="170" cy="150" rx="10" ry="2.5" fill="#c2cad1" />
          <path d="M162 150 Q170 140 178 150" stroke="#6d7780" strokeWidth="1.2" fill="none" />
          <path d="M168 148 l4 -8 l3 6 z" fill="#2f6bff" />
          <circle id="boat-bucket" cx="170" cy="150" r="1" fill="none" />
          {/* peti kayu + laptop + kopi */}
          <rect x="134" y="152" width="24" height="16" rx="1.5" fill="#a47148" />
          <path d="M134 158 H158 M134 163 H158" stroke="#7b5131" strokeWidth="1" />
          <ellipse className="laptop-glow" cx="146" cy="142" rx="18" ry="11" fill="#5ce1e6" />
          <rect x="136" y="134" width="20" height="15" rx="1.5" fill="#1e2a38" />
          <rect className="code-line l1" x="138.5" y="137" width="9" height="1.6" fill="#5ce1e6" />
          <rect className="code-line l2" x="140.5" y="140" width="12" height="1.6" fill="#ff7b54" />
          <rect className="code-line l3" x="140.5" y="143" width="7" height="1.6" fill="#39ff88" />
          <rect className="code-line l4" x="138.5" y="146" width="10" height="1.6" fill="#ffd166" />
          <rect x="133" y="149" width="26" height="3" rx="1" fill="#9aa5b1" />
          <rect x="184" y="158" width="7" height="9" rx="1.5" fill="#fff" />
          <path d="M191 160 q3 2 0 5" stroke="#fff" strokeWidth="1.4" fill="none" />
          <path className="steam" d="M187 155 q-2 -4 0 -7 t0 -7" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" fill="none" />

          {/* ---------- pemancing ---------- */}
          <g className="fisher">
            {/* kotak pendingin (tempat duduk) */}
            <rect x="92" y="148" width="38" height="20" rx="3" fill="#3a86c8" />
            <rect x="90" y="144" width="42" height="6" rx="2" fill="#e9f1f7" />
            <rect x="106" y="155" width="10" height="3" rx="1.5" fill="#2a6aa3" />
            {/* kaki */}
            <path d="M108 147 L92 151 L89 164" stroke="#24323f" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M104 146 L86 149 L82 163" stroke="#2d3e50" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="86" cy="165" rx="6.5" ry="3" fill="#1b1b1b" />
            <ellipse cx="80" cy="164.5" rx="6.5" ry="3" fill="#262626" />
            {/* badan (hoodie) */}
            <path d="M100 148 C96 132 100 116 114 112 C126 110 132 120 132 132 L130 148 Z" fill="url(#hoodieGrad)" />
            <path d="M110 108 Q120 101 129 109 Q125 116 116 114 Z" fill="#2f63b0" />
            <text x="105" y="135" className="hoodie-logo">&lt;/&gt;</text>
            {/* lengan belakang ke laptop */}
            <path d="M127 120 Q134 132 138 142" stroke="#2f63b0" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="138.5" cy="143" r="3.2" fill="#f1c27d" />
            {/* kepala */}
            <g className="fisher-head">
              <circle cx="116" cy="98" r="12" fill="#f1c27d" />
              <circle cx="123" cy="99" r="3" fill="#e0a96d" />
              <path d="M124 91 Q129 99 124 107 Q127 98 120 89 Z" fill="#4a3426" />
              <circle cx="110" cy="103" r="2.6" fill="#ff9f9f" opacity=".6" />
              <circle cx="110" cy="97" r="1.5" fill="#2b2b2b" />
              <path d="M107.5 93.5 l4 -0.8" stroke="#4a3426" strokeWidth="1.1" strokeLinecap="round" />
              <path className="mouth" d="M107 104 q2.5 2.5 5 0" stroke="#8b4513" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M103 92 Q116 74 129 92 Z" fill="#f4d35e" />
              <path d="M104 91 Q116 86 128 91 L128 93 Q116 88 104 93 Z" fill="#e76f51" />
              <ellipse cx="116" cy="93" rx="18" ry="4" fill="#e0b83a" />
            </g>
            {/* joran (melengkung saat strike) */}
            <motion.path d={rod.d} animate={{ d: rod.d }} transition={rodTransition} stroke="#3b2618" strokeWidth="3" fill="none" strokeLinecap="round" />
            <motion.circle id="rod-tip" r="1.5" fill="#cfd8dc" cx={rod.tip[0]} cy={rod.tip[1]} animate={{ cx: rod.tip[0], cy: rod.tip[1] }} transition={rodTransition} />
            <circle cx="100" cy="138" r="4.5" fill="#b0bec5" stroke="#607d8b" strokeWidth="1" />
            <line className="reel-handle" x1="100" y1="138" x2="104" y2="134" stroke="#607d8b" strokeWidth="1.6" strokeLinecap="round" />
            {/* lengan depan memegang joran */}
            <path d="M113 120 Q101 131 95 127" stroke="#4b8be0" strokeWidth="6.5" fill="none" strokeLinecap="round" />
            <circle cx="94" cy="126" r="3.6" fill="#f1c27d" />
          </g>

          {/* ---------- lambung kapal ---------- */}
          <path d="M10 164 H310 L286 202 Q160 222 40 206 Z" fill="url(#hullGrad)" />
          <path d="M22 176 Q160 185 300 176 M32 190 Q160 199 292 190" stroke="rgba(0,0,0,.14)" strokeWidth="1.5" fill="none" />
          <path d="M40 206 Q160 222 286 202 L281 210 Q160 230 48 214 Z" fill="#1f3b57" />
          <path d="M6 158 H314 L310 166 H10 Z" fill="#f5efe0" />
          <path d="M8 166 H310" stroke="#8b5a2b" strokeWidth="2" />
          <circle cx="58" cy="183" r="5" fill="url(#glassGrad)" stroke="#f5efe0" strokeWidth="2" />
          <circle cx="80" cy="185" r="5" fill="url(#glassGrad)" stroke="#f5efe0" strokeWidth="2" />
          <ellipse cx="146" cy="174" rx="4" ry="6.5" fill="#2b2d42" />
          <ellipse cx="262" cy="174" rx="4" ry="6.5" fill="#2b2d42" />
          <text x="186" y="191" className="boat-name">
            KM. DEBUG
          </text>
        </svg>
        )}
      </button>
    </motion.div>
  );
}
