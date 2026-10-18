import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projectFilters, projects } from '../data';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import TiltCard from './ui/TiltCard';
import '../styles/projects.css';

export default function Projects() {
  const [filter, setFilter] = useState('all');
  const shown = projects.filter((p) => filter === 'all' || p.cat === filter);

  return (
    <section className="zone" id="proyek">
      <div className="container">
        <SectionHead idx="03" zone="zona_batipelagik · 4.000 m" note="hanya cahaya dari makhluknya sendiri" title="Proyek" />

        <Reveal className="filters">
          {projectFilters.map(([key, label]) => (
            <button key={key} className={`chip filter${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
              {filter === key && (
                <motion.span layoutId="filter-pill" className="filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
              )}
              <span className="filter-label">{label}</span>
            </button>
          ))}
        </Reveal>

        <motion.div className="projects-grid" layout>
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.article
                key={p.title}
                layout
                className="project-item"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1], layout: { type: 'spring', stiffness: 300, damping: 30 } }}
              >
                <TiltCard className="glass project">
                  <div className={`project-media ${p.theme}`}>
                    <span className="win-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="emoji">{p.emoji}</span>
                    <span className="media-label mono">{p.label}</span>
                  </div>
                  <div className="project-body">
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                    <ul className="tags">
                      {p.tags.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                    <div className="project-links">
                      {p.links.map(([label, href]) => (
                        <a key={label} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
                          {label} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
