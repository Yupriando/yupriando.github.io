import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { profile } from '../data';
import '../styles/nav.css';

const LINKS = [
  ['tentang', 'Tentang', '200 m'],
  ['keahlian', 'Keahlian', '1.000 m'],
  ['proyek', 'Proyek', '4.000 m'],
  ['pengalaman', 'Pengalaman', '6.000 m'],
  ['kontak', 'Kontak', '10.994 m'],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ['top', ...LINKS.map(([id]) => id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <motion.header
      className={`nav${scrolled ? ' scrolled' : ''}${open ? ' open' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="#top" className="nav-logo" aria-label="Kembali ke permukaan" onClick={() => setOpen(false)}>
        <span className="logo-fish mono">&gt;&lt;&gt;</span> {profile.logo}
        <span className="accent">.dev</span>
      </a>

      <button
        className="nav-toggle"
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="nav-links">
        {LINKS.map(([id, label, depth]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} onClick={() => setOpen(false)}>
            {active === id && (
              <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <span className="nav-label">{label}</span>
            <small className="mono">{depth}</small>
          </a>
        ))}
      </nav>
    </motion.header>
  );
}
