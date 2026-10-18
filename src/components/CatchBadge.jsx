import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/catch-badge.css';

// Penghitung hasil pancingan & bug yang di-fix (muncul setelah tangkapan pertama)
export default function CatchBadge() {
  const [stats, setStats] = useState({ catches: 0, bugs: 0 });
  const [pop, setPop] = useState(0);

  useEffect(() => {
    const onFishing = (e) => {
      const { type, catches, bugs } = e.detail;
      if (type !== 'catch' && type !== 'bug') return;
      setStats({ catches, bugs });
      setPop((p) => p + 1);
    };
    window.addEventListener('ocean:fishing', onFishing);
    return () => window.removeEventListener('ocean:fishing', onFishing);
  }, []);

  const show = stats.catches + stats.bugs > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="catch-badge mono"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          aria-live="polite"
        >
          <motion.span key={pop} initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            🎣
          </motion.span>
          <span>
            <strong>{stats.catches}</strong> ikan
          </span>
          <span className="sep">·</span>
          <span>
            <strong>{stats.bugs}</strong> bug fixed
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
