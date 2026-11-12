import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data';
import { useToast } from './Toast';
import { ReefItems, handleReefClick, visibleRange } from '../reef/Reef';
import { assets } from '../assets';
import { assetUrl } from '../ocean/images';
import '../styles/seafloor.css';
import Icon from './ui/Icon';

// Tanah dasar laut dari gambar sendiri (src/assets.js → seafloor). Kosong = bentuk warna polos bawaan.
const GROUND = assets.seafloor || {};
const groundImage = (src) => (
  <image href={assetUrl(src)} x="0" y="0" width="1440" height="340" preserveAspectRatio="none" />
);


const frontSand = (x) => 268 + 7 * Math.sin(x / 210 + 2);
// kaki karang belakang: ikuti tepi atas gambar tanah (src/assets.js → seafloor.backTop) kalau ada
const BACK_TOP = GROUND.back && Array.isArray(GROUND.backTop) && GROUND.backTop.length > 1 ? GROUND.backTop : null;
const backHill = BACK_TOP
  ? (x) => {
      const step = 1440 / (BACK_TOP.length - 1);
      const i = Math.min(BACK_TOP.length - 2, Math.max(0, Math.floor(x / step)));
      const t = Math.min(1, Math.max(0, x / step - i));
      return BACK_TOP[i] + (BACK_TOP[i + 1] - BACK_TOP[i]) * t - 2; // ReefItems menambah +6 → kaki tertanam 4 unit
    }
  : (x) => 192 + 12 * Math.sin(x / 190 + 0.6);
const WEED = GROUND.weed?.src ? GROUND.weed : null;
const CHEST = GROUND.chest?.lid && GROUND.chest?.body ? GROUND.chest : null;
const TV = GROUND.tv || null;
const ITEMS = GROUND.chestItems || null; // gambar isi peti (koin, disket, bebek, kopi, CV)
// yang beterbangan saat peti dibuka
const BURST = ['{}', '🪙', '</>', ';', '🪙', 'git push', '🦆', '🪙', '200 OK']; // gambar TV dengan layar transparan (src/assets.js → seafloor.tv)

// jalur kabel internet bawah laut (dipakai untuk kabel, denyut data, dan area sentuhnya)
const CABLE_D = 'M-20 288 C200 276 380 300 620 290 S1000 276 1200 294 S1400 286 1460 290';

// Dasar laut: rumput laut, karang, komputer tenggelam, kabel internet, dan peti harta karun
export default function Seafloor() {
  // tinggi dasar laut di layar (lihat seafloor.css) → rentang karang yang terlihat
  const range = visibleRange(window.innerWidth <= 640 ? 460 : window.innerWidth <= 1240 ? 430 : 380, 340);
  const [open, setOpen] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const toast = useToast();

  // keterangan kabel: muncul di dekat kursor saat kabel disentuh (HP: diketuk, hilang sendiri)
  const floorRef = useRef(null);
  const tipTimer = useRef();
  const [cableTip, setCableTip] = useState(null);
  const showCableTip = (e, autoHide = false) => {
    const r = floorRef.current.getBoundingClientRect();
    const half = Math.min(170, r.width / 2 - 8); // label tidak keluar dari layar
    setCableTip({ x: Math.min(Math.max(e.clientX - r.left, half), r.width - half), y: e.clientY - r.top });
    clearTimeout(tipTimer.current);
    if (autoHide) tipTimer.current = setTimeout(() => setCableTip(null), 3500);
  };
  useEffect(() => () => clearTimeout(tipTimer.current), []);

  /*
   * Tata letak responsif TV & peti. SVG dasar laut "slice" (dipotong kiri-kanan di layar sempit),
   * jadi posisi TV dihitung dari bagian dasar laut yang TERLIHAT, dan peti (HTML) memakai pembagian
   * lebar yang sama → keduanya tidak pernah menumpuk di ukuran layar mana pun.
   */
  const [lay, setLay] = useState(null);
  useEffect(() => {
    const el = floorRef.current;
    const calc = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const s = Math.max(w / 1440, h / 340); // skala viewBox → piksel (sama dengan preserveAspectRatio slice)
      const vis = w / s; // lebar dasar laut yang terlihat (satuan viewBox)
      const [tvF, chestF] = w < 640 ? [0.3, 0.74] : w < 1100 ? [0.4, 0.76] : [0.62, 0.82];
      // < 1240px area tombol & copyright di bawah lebih tinggi → TV & peti naik ke bukit belakang supaya tidak tertutup
      const groundY = w < 1240 ? 205 : 262;
      setLay({ x0: 720 - vis / 2, vis, s, tvF, chestF, groundY });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const tvX = lay ? lay.x0 + lay.vis * lay.tvF - 60 : 872; // TV lebar 120 → dikurangi 60 supaya tengahnya pas
  const tvY = lay ? lay.groundY - 98 : 164; // TV tinggi ±106, kakinya sedikit terbenam di tanah
  const chestStyle = lay
    ? { left: `${lay.chestF * 100}%`, right: 'auto', bottom: `${Math.round((340 - lay.groundY) * lay.s)}px`, transform: 'translateX(-50%)' }
    : undefined;

  const toggleChest = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setBurstId(Date.now());
      toast('💰 Treasure found: my CV! Grab it above the chest ✨');
    }
  };

  return (
    <footer className="seafloor" ref={floorRef}>
      <svg className="floor-svg" viewBox="0 0 1440 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true" onClick={handleReefClick}>
        {GROUND.back ? (
          groundImage(GROUND.back)
        ) : (
          <path d="M0 210 C200 170 380 190 560 200 S900 160 1100 190 S1340 200 1440 180 V340 H0Z" fill="#0b1322" />
        )}
        <ReefItems variant="abyss" seed={1234} uid="floor" contour={backHill} step={[45, 90]} scale={[0.6, 0.95]} back range={range} />
        {WEED ? (
          // rumput laut dari gambar; pangkalnya tersembunyi di balik tanah depan
          <g>
            {WEED.items.map(([x, h, flip], i) => {
              const w = h * (WEED.ratio || 0.6);
              return (
                <g key={i} transform={`translate(${x} 292)${flip ? ' scale(-1 1)' : ''}`}>
                  <image className={`weed${['', ' d2', ' d3'][i % 3]}`} href={assetUrl(WEED.src)} x={-w / 2} y={-h} width={w} height={h} />
                </g>
              );
            })}
          </g>
        ) : (
          <g fill="none" strokeLinecap="round">
            <path className="weed" d="M120 280 C110 240 135 210 118 170 C105 140 130 120 122 90" stroke="#1d5a48" strokeWidth="7" />
            <path className="weed d2" d="M140 282 C150 250 128 225 145 190 C158 160 138 140 150 115" stroke="#174a3c" strokeWidth="6" />
            <path className="weed d3" d="M1240 276 C1230 236 1258 206 1240 166 C1226 136 1250 116 1244 86" stroke="#1d5a48" strokeWidth="7" />
            <path className="weed" d="M1262 280 C1270 250 1250 226 1266 196 C1278 172 1260 156 1270 132" stroke="#174a3c" strokeWidth="5" />
            <path className="weed d2" d="M640 274 C632 246 650 226 640 200" stroke="#1d5a48" strokeWidth="5" />
          </g>
        )}
        {TV ? (
          // TV tua yang tenggelam: layar (di belakang) terlihat lewat lubang kaca di gambar TV
          <g transform={`translate(${tvX.toFixed(1)} ${tvY}) rotate(-4 60 53)`}>
            <defs>
              <radialGradient id="tv-glow" cx="50%" cy="50%" r="65%">
                <stop offset="0" stopColor="#0d4a2a" />
                <stop offset="1" stopColor="#020a05" />
              </radialGradient>
              <pattern id="tv-scan" width="4" height="2.4" patternUnits="userSpaceOnUse">
                <rect width="4" height="1.1" fill="rgba(0,0,0,.35)" />
              </pattern>
            </defs>
            <rect x="11" y="36" width="78" height="55" rx="9" fill="url(#tv-glow)" />
            <text className="crt tv-text" x="19" y="58">
              &gt;_ hello
            </text>
            <text className="crt tv-text" x="19" y="73">
              world<tspan className="tv-cursor">▌</tspan>
            </text>
            <rect x="11" y="36" width="78" height="55" rx="9" fill="url(#tv-scan)" />
            <rect className="tv-flicker" x="11" y="36" width="78" height="55" rx="9" fill="#39ff88" />
            <image href={assetUrl(TV)} x="0" y="0" width="120" height="106" />
          </g>
        ) : (
          /* komputer tua yang tenggelam */
          <g transform="translate(900 214) rotate(-8)">
            <rect x="0" y="0" width="76" height="60" rx="6" fill="#2b3446" />
            <rect x="8" y="8" width="60" height="40" rx="3" fill="#06281a" />
            <text className="crt" x="13" y="24">
              &gt;_ hello
            </text>
            <text className="crt" x="13" y="38">
              world
            </text>
            <rect x="26" y="60" width="24" height="8" fill="#232b3a" />
          </g>
        )}
        {GROUND.front ? (
          groundImage(GROUND.front)
        ) : (
          <>
            <ellipse cx="470" cy="276" rx="60" ry="18" fill="#152036" />
            <ellipse cx="1060" cy="282" rx="80" ry="20" fill="#152036" />
            <path d="M0 272 C240 252 420 282 700 270 S1100 252 1440 274 V340 H0Z" fill="#101a2c" />
          </>
        )}
        <ReefItems variant="abyss" seed={5678} uid="floor" contour={frontSand} step={[70, 140]} scale={[0.7, 1]} x0={200} x1={1150} range={range} />
        {/* kabel internet bawah laut dengan denyut data */}
        <path d={CABLE_D} stroke="#05080f" strokeWidth="8" fill="none" />
        <path className={`cable-pulse${cableTip ? ' hot' : ''}`} d={CABLE_D} stroke="#5ce1e6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* area sentuh tak terlihat (lebih tebal dari kabel) → keterangan muncul saat disentuh */}
        <path
          className="cable-hit"
          d={CABLE_D}
          stroke="transparent"
          strokeWidth="26"
          fill="none"
          pointerEvents="stroke"
          onPointerMove={(e) => e.pointerType === 'mouse' && showCableTip(e)}
          onPointerOut={(e) => e.pointerType !== 'touch' && setCableTip(null)}
          onClick={(e) => {
            e.stopPropagation();
            showCableTip(e, true);
          }}
        />
      </svg>

      <div className={`chest-area${CHEST ? ' chest-area-img' : ''}`} style={chestStyle}>
        <AnimatePresence>
          {open && (
            <motion.a
              className="chest-reward"
              href={profile.cv}
              download
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.25 }}
            >
              <Icon name="file" /> Grab my CV
            </motion.a>
          )}
        </AnimatePresence>

        {burstId > 0 && open && (
          <div className="coin-burst" key={burstId} aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: (i - 4) * 18 + (Math.random() * 16 - 8), y: -90 - Math.random() * 60, opacity: 0, scale: 1, rotate: Math.random() * 360 }}
                transition={{ duration: 1.3, ease: 'easeOut' }}
              >
                {BURST[i % BURST.length]}
              </motion.span>
            ))}
          </div>
        )}

        <motion.button
          className={`chest${open ? ' open' : ''}${CHEST ? ' chest-img' : ''}`}
          onClick={toggleChest}
          aria-label={open ? 'Close the treasure chest' : 'Open the treasure chest'}
          whileHover={{ scale: 1.06, rotate: -2 }}
          whileTap={{ scale: 0.94 }}
        >
          {!open && <span className="chest-hint mono">click me ✨</span>}
          {CHEST ? (
            // peti dari gambar: isi bercahaya (paling belakang) → badan → tutup yang terangkat
            <span className="chest-stack" aria-hidden="true">
              {/* isi peti (viewBox 120x30 ≈ 2%–27% lebar dari atas; tepi badan peti di ±21.6%) */}
              <svg className="chest-inside" viewBox="0 0 120 30">
                <defs>
                  <radialGradient id="goldGlowImg">
                    <stop offset="0" stopColor="#ffe27a" stopOpacity=".95" />
                    <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="chestWall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0d0603" />
                    <stop offset="1" stopColor="#3a2410" />
                  </linearGradient>
                  <linearGradient id="chestSide" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#000" stopOpacity=".65" />
                    <stop offset="1" stopColor="#000" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* dinding dalam peti: selebar tepi atas badan peti (x 7–113), mulai tepat dari engsel tutup (tidak ada celah tembus) */}
                <rect x="7" y="0" width="106" height="30" fill="url(#chestWall)" />
                <rect x="7" y="0" width="13" height="30" fill="url(#chestSide)" />
                <rect x="100" y="0" width="13" height="30" fill="url(#chestSide)" transform="rotate(180 106.5 15)" />
                <rect x="7" y="0" width="106" height="2.2" fill="#5a3a1c" />
                <ellipse className="chest-glow" cx="60" cy="22" rx="66" ry="22" fill="url(#goldGlowImg)" />

                {/* harta karun programmer — bagian bawah tertutup badan peti (±y 23) */}
                {ITEMS ? (
                  <>
                    {/* koin di belakang & di sela-sela */}
                    {[[8, 14, 10], [40, 13, 9], [83, 14, 9.5], [102, 14, 10]].map(([x, y, w], i) => (
                      <image key={i} href={assetUrl(ITEMS.coin)} x={x} y={y} width={w} height={w} />
                    ))}
                    <image href={assetUrl(ITEMS.floppy)} x="10" y="7" width="15" height="15" transform="rotate(-12 17.5 14.5)" />
                    <image href={assetUrl(ITEMS.duck)} x="27" y="8.5" width="17" height="14.5" />
                    <text className="chest-braces" x="61" y="21" textAnchor="middle">{'{ }'}</text>
                    <image href={assetUrl(ITEMS.coffee)} x="71" y="11.5" width="17" height="11.5" />
                    <image href={assetUrl(ITEMS.cv)} x="91" y="4" width="10.5" height="15" transform="rotate(12 96 11.5)" />
                    <image href={assetUrl(ITEMS.coin)} x="55" y="16" width="8" height="8" />
                  </>
                ) : (
                  <>
                  {/* koin pengisi di belakang */}
                  <g fill="#ffc300">
                    <circle cx="13" cy="23" r="4.5" />
                    <circle cx="44" cy="22" r="4.5" fill="#ffd23f" />
                    <circle cx="86" cy="22.5" r="4.5" fill="#ffd23f" />
                    <circle cx="108" cy="23" r="4.5" />
                  </g>
                  {/* disket */}
                  <g transform="rotate(-14 22 16)">
                    <rect x="14" y="9" width="16" height="16" rx="1.4" fill="#2b4c7e" />
                    <rect x="18" y="9" width="8" height="5.5" fill="#c9d3dc" />
                    <rect x="23.5" y="9.8" width="1.8" height="3.8" fill="#2b4c7e" />
                    <rect x="16.5" y="17" width="11" height="7" rx=".6" fill="#f2efe6" />
                    <path d="M18 19.3 H26 M18 21.4 H24" stroke="#9aa6b2" strokeWidth=".7" />
                  </g>
                  {/* bebek karet (rubber duck debugging) */}
                  <g transform="translate(36 13)">
                    <ellipse cx="0" cy="8" rx="7" ry="5" fill="#ffd23f" />
                    <circle cx="2.5" cy="2" r="3.8" fill="#ffd23f" />
                    <path d="M5.8 1.6 L9.2 2.6 L5.8 3.6 Z" fill="#ff8c1a" />
                    <circle cx="3.6" cy="1.2" r=".75" fill="#1b1b2f" />
                    <path d="M-5.5 6 Q-2 3.5 1 7" fill="none" stroke="#e8b400" strokeWidth=".9" />
                  </g>
                  {/* kurung kurawal emas yang berpendar */}
                  <text className="chest-braces" x="60" y="21" textAnchor="middle">{'{ }'}</text>
                  {/* cangkir kopi + uap */}
                  <g transform="translate(77 12)">
                    <path className="chest-steam" d="M2 -1 q-2 -3 0 -5 M5 -1 q2 -3 0 -5" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth=".8" strokeLinecap="round" />
                    <rect x="-1" y="0" width="9" height="11" rx="1.6" fill="#f1ece4" />
                    <path d="M8 2.5 h1.6 a2.4 2.4 0 0 1 0 4.8 H8" fill="none" stroke="#f1ece4" strokeWidth="1.3" />
                    <rect x="-1" y="0" width="9" height="2" rx="1" fill="#5b3a21" />
                    <text x="3.5" y="8.2" textAnchor="middle" fontSize="3.6" fontFamily="JetBrains Mono, monospace" fill="#5b3a21">{'</>'}</text>
                  </g>
                  {/* gulungan CV */}
                  <g transform="rotate(14 99 16)">
                    <rect x="95" y="8" width="8" height="15" rx="1" fill="#f4e6c4" />
                    <rect x="94" y="7" width="10" height="2.4" rx="1.2" fill="#d9c49a" />
                    <path d="M97 12 H101 M97 14 H101 M97 16 H100" stroke="#a08a63" strokeWidth=".6" />
                    <text x="99" y="20.5" textAnchor="middle" fontSize="2.6" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="#8a5a2b">CV</text>
                  </g>
                  </>
                )}
              </svg>
              <img className="chest-body" src={assetUrl(CHEST.body)} alt="" draggable="false" />
              <img className="chest-lid" src={assetUrl(CHEST.lid)} alt="" draggable="false" />
            </span>
          ) : (
          <svg viewBox="0 0 120 100" aria-hidden="true">
            <defs>
              <radialGradient id="goldGlow">
                <stop offset="0" stopColor="#ffe27a" stopOpacity=".9" />
                <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse className="chest-glow" cx="60" cy="42" rx="58" ry="40" fill="url(#goldGlow)" />
            <g>
              <circle cx="40" cy="48" r="7" fill="#ffd23f" />
              <circle cx="56" cy="44" r="7" fill="#ffc300" />
              <circle cx="72" cy="47" r="7" fill="#ffd23f" />
              <circle cx="84" cy="49" r="6" fill="#ffc300" />
            </g>
            <rect x="14" y="50" width="92" height="42" rx="4" fill="#6b3f1f" />
            <rect x="14" y="50" width="92" height="7" fill="#c99a2e" />
            <rect x="14" y="84" width="92" height="5" fill="#c99a2e" />
            <rect x="54" y="50" width="12" height="42" fill="#c99a2e" />
            <rect x="56" y="62" width="8" height="10" rx="2" fill="#3a2410" />
            <g className="lid">
              <path d="M14 50 V36 Q60 12 106 36 V50 Z" fill="#7d4a24" />
              <path d="M54 50 V23 Q60 22 66 23 V50Z" fill="#c99a2e" />
              <path d="M14 46 H106 V50 H14Z" fill="#c99a2e" />
            </g>
          </svg>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {cableTip && (
          <motion.p
            className="cable-label mono"
            role="tooltip"
            style={{ left: cableTip.x, top: cableTip.y }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
          >
            🌐 Undersea fiber-optic cable · ~99% of the world's internet traffic passes through here
          </motion.p>
        )}
      </AnimatePresence>

      <div className="footer-bottom">
        <motion.button
          className="btn btn-ghost btn-small"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon name="arrow-up" /> Back to the surface
        </motion.button>
        <p className="small muted">
          © {new Date().getFullYear()} {profile.name} · built with React, Framer Motion &amp; 🐟 ·{' '}
          <span className="mono">git commit -m "keep swimming"</span>
        </p>
      </div>
    </footer>
  );
}
