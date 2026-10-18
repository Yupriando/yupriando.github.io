import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { experiences } from '../data';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import '../styles/experience.css';

export default function Experience() {
  const listRef = useRef(null);
  // garis rantai jangkar tumbuh mengikuti scroll
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 60%'] });

  return (
    <section className="zone" id="pengalaman">
      <div className="container">
        <SectionHead idx="04" zone="zona_abisopelagik · 6.000 m" note="gelap total, kursormu jadi senter 🔦" title="Pengalaman" />

        <ol className="timeline" ref={listRef}>
          <span className="tl-track" aria-hidden="true" />
          <motion.span className="tl-progress" style={{ scaleY: scrollYProgress }} aria-hidden="true" />
          <span className="tl-anchor" aria-hidden="true">⚓</span>

          {experiences.map((exp, i) => (
            <Reveal as="li" className="tl-item" key={exp.role + exp.date} x={-40} y={0} delay={i * 0.05}>
              <motion.span
                className="tl-node"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
              />
              <motion.div className="glass tl-card" whileHover={{ x: 6 }}>
                <span className="tl-date mono">{exp.date}</span>
                <h3>
                  {exp.role} <span className="at">@ {exp.at}</span>
                </h3>
                <ul>
                  {exp.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                {exp.tags && (
                  <ul className="tags">
                    {exp.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
