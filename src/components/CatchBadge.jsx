import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPECIES, ZONE_FISH } from '../ocean/species';
import { FISH_FACTS } from '../ocean/fishFacts';
import '../styles/catch-badge.css';
import Icon from './ui/Icon';

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

// kartu pengetahuan satu ikan (data dari src/ocean/fishFacts.js)
function FactCard({ id, count, onBack }) {
  const sp = SPECIES[id];
  const info = FISH_FACTS[id];
  const src = sp.img?.src;
  return (
    <div className="cl-card">
      <button type="button" className="cl-back mono" onClick={onBack} autoFocus>
        ← all fish
      </button>
      <div className="cl-card-pic">{src ? <img src={src} alt={sp.name} /> : <span>🐟</span>}</div>
      <h4 className="cl-card-name">
        {sp.name}
        {sp.rare && <span className="cl-card-rare mono">rare</span>}
      </h4>
      {info?.sci && <p className="cl-card-sci">{info.sci}</p>}
      <p className="cl-card-count mono">caught ×{count}</p>
      {info ? (
        <>
          <dl className="cl-card-meta">
            {[
              ['Local name', info.local],
              ['Size', info.size],
              ['Habitat', info.habitat],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          <ul className="cl-card-facts">
            {info.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="cl-card-none">No fun facts for this one yet.</p>
      )}
    </div>
  );
}

export default function CatchBadge() {
  const [log, setLog] = useState(loadLog);
  const [pop, setPop] = useState(0);
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState(null); // spesies yang baru saja ditemukan pertama kali
  const [picked, setPicked] = useState(null); // ikan yang kartu faktanya sedang dibuka
  const panelRef = useRef(null);
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
    if (!open) {
      setPicked(null);
      return;
    }
    // Esc: dari kartu fakta kembali ke daftar dulu, baru menutup panel
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setPicked((p) => {
        if (!p) setOpen(false);
        return null;
      });
    };
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

  // buka kartu fakta; panel digulir ke atas supaya kartunya langsung terlihat
  const pick = (id) => {
    setPicked(id);
    if (panelRef.current) panelRef.current.scrollTop = 0;
  };

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
          <div ref={panelRef} className={`catch-log${open ? ' open' : ''}`} role="dialog" aria-label="Catch log" aria-hidden={!open} inert={open ? undefined : ''}>
                <div className="cl-head">
                  <strong><Icon name="hook" /> Catch Log</strong>
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
                {picked && SPECIES[picked] ? (
                  <FactCard id={picked} count={log.counts[picked] || 0} onBack={() => setPicked(null)} />
                ) : (
                  <>
                    {discovered > 0 && <p className="cl-tip mono">tap a fish to learn about it</p>}
                    <ul className="cl-grid">
                      {species.map((id) => {
                        const sp = SPECIES[id];
                        const n = log.counts[id] || 0;
                        const src = sp.img?.src;
                        return (
                          <li key={id} className={`${n ? 'got' : 'unknown'}${fresh === id ? ' fresh' : ''}`}>
                            <button
                              type="button"
                              className="cl-cell"
                              onClick={() => n && pick(id)}
                              aria-disabled={!n}
                              aria-label={n ? `${sp.name}, caught ${n} times. Show facts` : 'Undiscovered species'}
                              title={n ? 'Show facts' : 'Catch it to unlock its facts'}
                            >
                              <span className="cl-pic">{src ? <img src={src} alt="" /> : <span>🐟</span>}</span>
                              <span className="cl-name">{n ? sp.name : '???'}</span>
                              {n > 0 && <span className="cl-count mono">×{n}</span>}
                              {sp.rare && n > 0 && <span className="cl-rare">✨</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
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
              <Icon name="hook" />
            </motion.span>
            <span>
              <strong>{totalFish}</strong> <span className="cb-label">fish</span>
              <span className="cb-icon" aria-hidden="true"><Icon name="fish" /></span>
            </span>
            <span className="sep">·</span>
            <span>
              <strong>{log.bugs}</strong> <span className="cb-label">bug fixed</span>
              <span className="cb-icon" aria-hidden="true"><Icon name="bug" /></span>
            </span>
            {fresh && !open && <span className="cl-new">NEW</span>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
