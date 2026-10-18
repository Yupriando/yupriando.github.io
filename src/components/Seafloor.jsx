import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data';
import { useToast } from './Toast';
import { ReefItems, handleReefClick } from '../reef/Reef';
import '../styles/seafloor.css';

const backHill = (x) => 192 + 12 * Math.sin(x / 190 + 0.6);
const frontSand = (x) => 268 + 7 * Math.sin(x / 210 + 2);

// Dasar laut: rumput laut, karang, komputer tenggelam, kabel internet, dan peti harta karun
export default function Seafloor() {
  const [open, setOpen] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const toast = useToast();

  const toggleChest = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setBurstId(Date.now());
      toast('💰 Harta karun ditemukan: CV-ku! Ambil di atas peti ✨');
    }
  };

  return (
    <footer className="seafloor">
      <svg className="floor-svg" viewBox="0 0 1440 340" preserveAspectRatio="xMidYMax slice" aria-hidden="true" onClick={handleReefClick}>
        <path d="M0 210 C200 170 380 190 560 200 S900 160 1100 190 S1340 200 1440 180 V340 H0Z" fill="#0b1322" />
        <ReefItems variant="abyss" seed={1234} uid="floor" contour={backHill} step={[45, 90]} scale={[0.6, 0.95]} back />
        <g fill="none" strokeLinecap="round">
          <path className="weed" d="M120 280 C110 240 135 210 118 170 C105 140 130 120 122 90" stroke="#1d5a48" strokeWidth="7" />
          <path className="weed d2" d="M140 282 C150 250 128 225 145 190 C158 160 138 140 150 115" stroke="#174a3c" strokeWidth="6" />
          <path className="weed d3" d="M1240 276 C1230 236 1258 206 1240 166 C1226 136 1250 116 1244 86" stroke="#1d5a48" strokeWidth="7" />
          <path className="weed" d="M1262 280 C1270 250 1250 226 1266 196 C1278 172 1260 156 1270 132" stroke="#174a3c" strokeWidth="5" />
          <path className="weed d2" d="M640 274 C632 246 650 226 640 200" stroke="#1d5a48" strokeWidth="5" />
        </g>
        <g transform="translate(420 0)">
          <path
            d="M330 270 C330 240 320 228 310 214 M330 250 C338 236 350 230 352 214 M330 262 C322 252 300 248 296 236"
            stroke="#5a2a4f"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <circle className="bio" cx="310" cy="212" r="3" fill="#ff7bd5" />
          <circle className="bio b2" cx="352" cy="212" r="3" fill="#7bf3ff" />
          <circle className="bio b3" cx="296" cy="234" r="2.5" fill="#ff7bd5" />
        </g>
        {/* komputer tua yang tenggelam */}
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
        <ellipse cx="470" cy="276" rx="60" ry="18" fill="#152036" />
        <ellipse cx="1060" cy="282" rx="80" ry="20" fill="#152036" />
        <path d="M0 272 C240 252 420 282 700 270 S1100 252 1440 274 V340 H0Z" fill="#101a2c" />
        <ReefItems variant="abyss" seed={5678} uid="floor" contour={frontSand} step={[70, 140]} scale={[0.7, 1]} x0={200} x1={1150} />
        {/* kabel internet bawah laut dengan denyut data */}
        <path d="M-20 288 C200 276 380 300 620 290 S1000 276 1200 294 S1400 286 1460 290" stroke="#05080f" strokeWidth="8" fill="none" />
        <path
          className="cable-pulse"
          d="M-20 288 C200 276 380 300 620 290 S1000 276 1200 294 S1400 286 1460 290"
          stroke="#5ce1e6"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className="chest-area">
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
              📜 Ambil CV-ku
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
                {i % 3 === 0 ? '{}' : '🪙'}
              </motion.span>
            ))}
          </div>
        )}

        <motion.button
          className={`chest${open ? ' open' : ''}`}
          onClick={toggleChest}
          aria-label={open ? 'Tutup peti harta karun' : 'Buka peti harta karun'}
          whileHover={{ scale: 1.06, rotate: -2 }}
          whileTap={{ scale: 0.94 }}
        >
          {!open && <span className="chest-hint mono">klik aku ✨</span>}
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
        </motion.button>
      </div>

      <p className="cable-label mono">↳ kabel serat optik bawah laut · ~99% lalu lintas internet dunia lewat sini</p>

      <div className="footer-bottom">
        <motion.button
          className="btn btn-ghost btn-small"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          🫧 Kembali ke permukaan
        </motion.button>
        <p className="small muted">
          © {new Date().getFullYear()} {profile.name} · dibangun dengan React, Framer Motion &amp; 🐟 ·{' '}
          <span className="mono">git commit -m "keep swimming"</span>
        </p>
      </div>
    </footer>
  );
}
