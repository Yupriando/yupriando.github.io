import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data';
import { useToast } from './Toast';

/*
 * Foto profil di balik helm selam kuningan.
 * Ketuk helm → kaca depan terbuka → helm terangkat → wajah terlihat.
 * Ketuk lagi → helm turun & kaca tertutup kembali.
 */

const EASE = [0.22, 1, 0.36, 1];

// helm: terangkat SETELAH kaca terbuka, turun SEBELUM kaca menutup
const helmetVariants = {
  on: { y: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 170, damping: 17 } },
  off: { y: -210, opacity: 0, rotate: -10, transition: { delay: 0.5, duration: 0.75, ease: EASE } },
};
const plateVariants = {
  on: { rotateY: 0, transition: { delay: 0.55, type: 'spring', stiffness: 220, damping: 16 } },
  off: { rotateY: -112, transition: { duration: 0.5, ease: EASE } },
};

const BUBBLES = [
  { x: -18, size: 9, delay: 0 },
  { x: 6, size: 6, delay: 0.08 },
  { x: 22, size: 11, delay: 0.16 },
  { x: -4, size: 5, delay: 0.24 },
  { x: 14, size: 7, delay: 0.32 },
];

function HelmetSvg() {
  return (
    <svg className="helmet-svg" viewBox="0 0 200 220" aria-hidden="true">
      <defs>
        <radialGradient id="brass" cx="38%" cy="28%" r="80%">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset="0.28" stopColor="#f0c14b" />
          <stop offset="0.65" stopColor="#c08a1e" />
          <stop offset="1" stopColor="#6b4510" />
        </radialGradient>
        <linearGradient id="brassDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9a63a" />
          <stop offset="1" stopColor="#7a5212" />
        </linearGradient>
        <radialGradient id="portGlass" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#bfe9ff" />
          <stop offset="1" stopColor="#1d4d73" />
        </radialGradient>
        {/* lubang jendela depan supaya foto di belakang terlihat */}
        <mask id="window-hole">
          <rect width="200" height="220" fill="#fff" />
          <circle cx="100" cy="105" r="50" fill="#000" />
        </mask>
      </defs>

      <g mask="url(#window-hole)">
        {/* pelat bahu (corselet) */}
        <path d="M14 214 C14 178 46 164 100 164 C154 164 186 178 186 214 Z" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="2" />
        <path d="M20 212 C24 186 54 174 100 174 C146 174 176 186 180 212" fill="none" stroke="#ffe3a0" strokeOpacity="0.35" strokeWidth="2" />
        {[34, 62, 100, 138, 166].map((x, i) => (
          <circle key={x} cx={x} cy={[200, 186, 182, 186, 200][i]} r="4.5" fill="url(#brass)" stroke="#5a3a0c" strokeWidth="1.2" />
        ))}
        {/* plakat nama */}
        <rect x="76" y="192" width="48" height="16" rx="3" fill="#a9771c" stroke="#5a3a0c" strokeWidth="1.2" />
        <text x="100" y="203.5" textAnchor="middle" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#4a2f08">
          {profile.logo.toUpperCase()}
        </text>

        {/* leher */}
        <rect x="52" y="152" width="96" height="18" rx="6" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="2" />

        {/* kubah helm */}
        <circle cx="100" cy="100" r="76" fill="url(#brass)" stroke="#5a3a0c" strokeWidth="2.5" />
        <path d="M48 52 C62 34 84 26 104 26" fill="none" stroke="#fff8d8" strokeOpacity="0.7" strokeWidth="5" strokeLinecap="round" />

        {/* jendela samping */}
        {[24, 176].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="104" r="17" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="2" />
            <circle cx={cx} cy="104" r="10" fill="url(#portGlass)" stroke="#5a3a0c" strokeWidth="1.5" />
            <path d={`M${cx - 5} 99 a7 7 0 0 1 6 -3`} stroke="#fff" strokeOpacity="0.8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* pegangan & katup udara di atas */}
        <path d="M80 30 L80 14 Q100 4 120 14 L120 30" fill="none" stroke="#6b4510" strokeWidth="9" strokeLinejoin="round" />
        <path d="M80 30 L80 14 Q100 4 120 14 L120 30" fill="none" stroke="#f0c14b" strokeWidth="5" strokeLinejoin="round" />
        <rect x="150" y="38" width="20" height="12" rx="3" transform="rotate(35 160 44)" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="1.5" />
        <rect x="32" y="40" width="16" height="10" rx="3" transform="rotate(-35 40 45)" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="1.5" />

        {/* paku keliling */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={100 + Math.cos(a) * 68} cy={100 + Math.sin(a) * 68} r="2.4" fill="#ffe08a" stroke="#6b4510" strokeWidth="0.8" />;
        })}

        {/* dudukan engsel (kiri) & mur kupu-kupu (kanan) */}
        <rect x="40" y="96" width="12" height="18" rx="3" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="1.5" />
        <path d="M150 98 l12 -8 v30 l-12 -8 Z" fill="url(#brassDark)" stroke="#5a3a0c" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// Gambar helm (lukisan): badan berlubang + pintu kaca. Kalau gagal dimuat, pakai helm SVG.
const HELMET_BODY = 'assets/helm/helm-badan.webp';
const HELMET_DOOR = 'assets/helm/helm-kaca.webp';

export default function DiveHelmet() {
  const [open, setOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [svgHelmet, setSvgHelmet] = useState(false);
  const [puffs, setPuffs] = useState(0);
  const greeted = useRef(false);
  const toast = useToast();

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) {
      setPuffs((n) => n + 1);
      if (!greeted.current) {
        greeted.current = true;
        setTimeout(() => toast(`Hi! 👋 I'm ${profile.name}, nice to meet you`), 900);
      }
    }
  };

  return (
    <div className="helmet-wrap">
      <button
        type="button"
        className={`helmet-stage${open ? ' is-open' : ''}`}
        onClick={toggle}
        aria-pressed={open}
        aria-label={open ? 'Put the diving helmet back on' : 'Open the diving helmet to see my face'}
      >
        {/* foto di dalam jendela kapal (lapisan paling belakang) */}
        <div className="porthole">
          <div className="porthole-inner">
            {profile.photo && !photoFailed ? (
              <img src={profile.photo} alt={profile.name} onError={() => setPhotoFailed(true)} />
            ) : (
              <span>{profile.initial}</span>
            )}
          </div>
        </div>

        {/* helm kuningan + kaca depan */}
        <motion.div className="helmet" variants={helmetVariants} initial={false} animate={open ? 'off' : 'on'}>
          {svgHelmet ? (
            <>
              <HelmetSvg />
              <motion.div className="faceplate" variants={plateVariants} initial={false} animate={open ? 'off' : 'on'}>
                <span className="faceplate-glass" />
                <i className="bolt b1" />
                <i className="bolt b2" />
                <i className="bolt b3" />
                <i className="bolt b4" />
              </motion.div>
            </>
          ) : (
            <>
              <img className="helmet-img" src={HELMET_BODY} alt="" draggable="false" onError={() => setSvgHelmet(true)} />
              <motion.img
                className="faceplate-img"
                src={HELMET_DOOR}
                alt=""
                draggable="false"
                variants={plateVariants}
                initial={false}
                animate={open ? 'off' : 'on'}
                onError={() => setSvgHelmet(true)}
              />
            </>
          )}
        </motion.div>

        {/* gelembung saat helm dibuka */}
        <AnimatePresence>
          {open && (
            <span className="helmet-bubbles" key={puffs}>
              {BUBBLES.map((b, i) => (
                <motion.i
                  key={i}
                  style={{ width: b.size, height: b.size, marginLeft: b.x }}
                  initial={{ y: 0, opacity: 0, scale: 0.4 }}
                  animate={{ y: -120, opacity: [0, 1, 0], scale: 1 }}
                  transition={{ duration: 1.1, delay: b.delay, ease: 'easeOut' }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </button>

    </div>
  );
}
