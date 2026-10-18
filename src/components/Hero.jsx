import { useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { profile } from '../data';
import useTyping from '../hooks/useTyping';
import { createSky } from '../ocean/sky';
import { useToast } from './Toast';
import Boat from './Boat';
import '../styles/hero.css';

const ease = [0.22, 1, 0.36, 1];
const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
});

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() < 0.15 ? 3 : 1 + Math.random(),
        delay: `${Math.random() * 4}s`,
        duration: `${2 + Math.random() * 3}s`,
      })),
    []
  );
  return (
    <div className="stars">
      {stars.map((s, i) => (
        <span
          key={i}
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.duration }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const skyRef = useRef(null);
  const toast = useToast();

  // burung camar interaktif (logikanya di ocean/sky.js)
  useEffect(() => createSky(skyRef.current, ref.current, { toast }), [toast]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // parallax: teks naik & memudar, matahari tenggelam, kapal sedikit turun, langit menggelap
  const textY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const boatY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const skyDim = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const typed = useTyping(profile.roles);
  const letters = Array.from(profile.name);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-bg" aria-hidden="true">
        <div className="sky">
          <Stars />
          <motion.div className="sun" style={{ y: sunY }} />
          <div className="cloud c1" />
          <div className="cloud c2" />
          <div className="cloud c3" />
          {['g1', 'g2', 'g3'].map((g) => (
            <div key={g} className={`gull ${g}`}>
              <svg viewBox="0 0 24 10">
                <path d="M0 6 Q6 0 12 6 Q18 0 24 6" />
              </svg>
            </div>
          ))}
          <motion.div className="sky-dim" style={{ opacity: skyDim }} />
        </div>
        <div className="sea">
          <div className="wave w1" />
          <div className="wave w2" />
          <div className="sun-reflect" />
          <div className="rays" />
        </div>
      </div>

      <canvas ref={skyRef} className="sky-canvas" aria-hidden="true" />

      <motion.div className="hero-content" style={{ y: textY, opacity: textOpacity }}>
        <motion.p className="hero-greet mono" {...fadeUp(0.4)}>
          <span className="prompt">&gt;</span> Halo, salam kenal 👋 aku
        </motion.p>

        <h1 className="hero-name" aria-label={profile.name}>
          {letters.map((ch, i) => (
            <span className="letter-mask" key={i} aria-hidden="true">
              <motion.span
                className="letter"
                initial={{ y: '110%', rotate: 12, opacity: 0 }}
                animate={{ y: '0%', rotate: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.07, type: 'spring', stiffness: 180, damping: 16 }}
                whileHover={{ y: -12, rotate: -6, color: '#5ce1e6', transition: { type: 'spring', stiffness: 500, damping: 12 } }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p className="hero-role mono" {...fadeUp(1.2)}>
          <span className="prompt">~$</span> whoami → <span className="typed">{typed}</span>
          <span className="caret" />
        </motion.p>
        <motion.p className="hero-desc" {...fadeUp(1.4)}>
          {profile.heroDesc}
        </motion.p>
        <motion.div className="hero-cta" {...fadeUp(1.6)}>
          <motion.a className="btn btn-primary" href="#tentang" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}>
            Mulai Menyelam ↓
          </motion.a>
          <motion.a className="btn btn-ghost" href="#kontak" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}>
            Hubungi Aku
          </motion.a>
        </motion.div>
      </motion.div>

      <Boat style={{ y: boatY }} />

      <div className="wave wave-front" aria-hidden="true" />

      <motion.a href="#tentang" className="scroll-hint" style={{ opacity: hintOpacity }} aria-label="Scroll untuk menyelam">
        <span className="mouse">
          <span />
        </span>
        <span className="mono">scroll untuk menyelam</span>
      </motion.a>
    </section>
  );
}
