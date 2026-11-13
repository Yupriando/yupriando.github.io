import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { github, projectFilters } from '../data';
import useGithubProjects from '../hooks/useGithubProjects';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import TiltCard from './ui/TiltCard';
import DemoModal from './DemoModal';
import { assetUrl } from '../ocean/images';
import '../styles/projects.css';
import Icon from './ui/Icon';

const TRY_LABEL = {
  app: ['play', 'Try It Live'],
  api: ['play', 'Try the API'],
  design: ['palette', 'View Design'],
};

const STATUS = {
  loading: 'fetching repos from GitHub…',
  live: 'live data from GitHub',
  offline: 'GitHub is unreachable, showing saved data',
};

export default function Projects() {
  const [filter, setFilter] = useState('all');
  const [demo, setDemo] = useState(null);
  const { list, status } = useGithubProjects();
  const closeDemo = useCallback(() => setDemo(null), []);

  const shown = list.filter((p) => filter === 'all' || (filter === 'live' ? p.demo : p.cat === filter));

  const openDemo = (p) => {
    if (p.embed === false) window.open(p.demo, '_blank', 'noopener');
    else setDemo(p);
  };

  return (
    <section className="zone" id="projects">
      <div className="container">
        <SectionHead idx="03" zone="bathypelagic_zone · 4,000 m" note="the only light comes from the creatures themselves" title="Projects" />

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

        <p className={`gh-status mono small ${status}`}>
          <span className="gh-dot" /> {STATUS[status]} ·{' '}
          <a href={`https://github.com/${github.username}`} target="_blank" rel="noopener">
            @{github.username}
          </a>
        </p>

        <motion.div className="projects-grid" layout>
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.article
                key={p.repo}
                layout
                className="project-item"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1], layout: { type: 'spring', stiffness: 300, damping: 30 } }}
              >
                <TiltCard className="glass project">
                  <div className={`project-media ${p.theme}${p.thumb ? ' has-thumb' : ''}`}>
                    {p.thumb && <img className="project-thumb" src={assetUrl(p.thumb)} alt={`Screenshot of ${p.title}`} loading="lazy" />}
                    <span className="win-dots">
                      <i />
                      <i />
                      <i />
                    </span>
                    {p.demo && <span className="live-badge mono">● LIVE</span>}
                    {!p.thumb && <span className="emoji">{p.emoji}</span>}
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
                      {p.demo && (
                        <button className="btn btn-primary btn-try" onClick={() => openDemo(p)}>
                          {(([ic, label]) => <><Icon name={ic} /> {label}</>)(TRY_LABEL[p.demoType] || TRY_LABEL.app)}
                        </button>
                      )}
                      {p.apk && (
                        <a href={p.apk} title="Android app (APK)">
                          APK ↓
                        </a>
                      )}
                      <a href={p.url} target="_blank" rel="noopener">
                        Code ↗
                      </a>
                    </div>
                  </div>
                </TiltCard>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <DemoModal project={demo} onClose={closeDemo} />
    </section>
  );
}
