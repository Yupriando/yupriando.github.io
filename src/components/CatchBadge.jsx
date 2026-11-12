import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPECIES, ZONE_FISH } from '../ocean/species';
import '../styles/catch-badge.css';

/*
 * Penghitung hasil pancingan + Catch Log (klik badge → koleksi ikan yang sudah ditangkap).
 * Disimpan di browser pengunjung, jadi koleksinya tidak hilang saat halaman di-refresh.
 */
const STORE_KEY = 'ocean-catch-log';

function loadLog() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (saved && typeof saved === 'object') return { counts: saved.counts || {}, bugs: saved.bugs || 0 };
  } catch {}
  return { counts: {}, bugs: 0 };
}
function saveLog(log) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(log));
  } catch {}
}

// ikan yang bisa dipancing: kail hanya ada di permukaan → spesies zona permukaan, bukan satwa dilindungi & bukan "bug"
function catchableSpecies() {
  return [...new Set(ZONE_FISH[0])].filter((id) => SPECIES[id] && !SPECIES[id].protect && id !== 'ascii');
}

export default function CatchBadge() {
  const [log, setLog] = useState(loadLog);
  const [pop, setPop] = useState(0);
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState(null); // spesies yang baru saja ditemukan pertama kali
  const wrapRef = useRef(null);

  useEffect(() => {
    const onFishing = (e) => {
      const { type, id } = e.detail;
      if (type !== 'catch' && type !== 'bug') return;
      setLog((prev) => {
        const next =
          type === 'bug'
            ? { ...prev, bugs: prev.bugs + 1 }
            : { ...prev, counts: { ...prev.counts, [id]: (prev.counts[id] || 0) + 1 } };
        if (type === 'catch' && id && !prev.counts[id]) setFresh(id);
        saveLog(next);
        return next;
      });
      setPop((p) => p + 1);
    };
    window.addEventListener('ocean:fishing', onFishing);
    return () => window.removeEventListener('ocean:fishing', onFishing);
  }, []);

  // tutup panel: tombol Esc atau klik di luar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // dihitung ulang tiap panel dibuka (ikan baru dari src/assets.js didaftarkan saat kanvas laut mulai)
  const species = useMemo(() => catchableSpecies(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalFish = Object.values(log.counts).reduce((a, b) => a + b, 0);
  const discovered = species.filter((id) => log.counts[id]).length;
  const show = totalFish + log.bugs > 0;

  const reset = () => {
    const empty = { counts: {}, bugs: 0 };
    saveLog(empty);
    setLog(empty);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={wrapRef}
          className="catch-wrap"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          {/* panel selalu ada, muncul/hilang lewat transisi CSS (lebih andal daripada animasi keluar bersarang) */}
          <div className={`catch-log${open ? ' open' : ''}`} role="dialog" aria-label="Catch log" aria-hidden={!open} inert={open ? undefined : ''}>
                <div className="cl-head">
                  <strong>🎣 Catch Log</strong>
                  <button className="cl-close" onClick={() => setOpen(false)} aria-label="Close catch log">
                    ✕
                  </button>
                </div>
                <div className="cl-progress mono">
                  <span>
                    <b>{discovered}</b> / {species.length} species discovered
                  </span>
                  <i style={{ '--p': `${species.length ? (discovered / species.length) * 100 : 0}%` }} />
                </div>
                <ul className="cl-grid">
                  {species.map((id) => {
                    const sp = SPECIES[id];
                    const n = log.counts[id] || 0;
                    const src = sp.img?.src;
                    return (
                      <li key={id} className={`${n ? 'got' : 'unknown'}${fresh === id ? ' fresh' : ''}`}>
                        <span className="cl-pic">{src ? <img src={src} alt="" /> : <span>🐟</span>}</span>
                        <span className="cl-name">{n ? sp.name : '???'}</span>
                        {n > 0 && <span className="cl-count mono">×{n}</span>}
                        {sp.rare && n > 0 && <span className="cl-rare">✨</span>}
                      </li>
                    );
                  })}
                </ul>
                <div className="cl-foot mono">
                  <span>🐛 {log.bugs} bug{log.bugs === 1 ? '' : 's'} fixed</span>
                  <button className="cl-reset" onClick={reset}>
                    reset
                  </button>
                </div>
                {discovered === species.length && species.length > 0 && (
                  <p className="cl-done">🏆 You caught every species! Master angler unlocked.</p>
                )}
          </div>

          <button
            className="catch-badge mono"
            onClick={() => {
              setOpen((o) => !o);
              setFresh(null);
            }}
            aria-expanded={open}
            aria-label={`Open catch log: ${totalFish} fish caught, ${log.bugs} bugs fixed`}
            title="See what you've caught"
          >
            <motion.span key={pop} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
              🎣
            </motion.span>
            <span>
              <strong>{totalFish}</strong> <span className="cb-label">fish</span>
              <span className="cb-icon" aria-hidden="true">🐟</span>
            </span>
            <span className="sep">·</span>
            <span>
              <strong>{log.bugs}</strong> <span className="cb-label">bug fixed</span>
              <span className="cb-icon" aria-hidden="true">🐛</span>
            </span>
            {fresh && !open && <span className="cl-new">NEW</span>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
