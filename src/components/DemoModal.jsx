import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './ui/Icon';

const HINTS = {
  app: 'This app is running live, go ahead and try it 👆',
  api: 'This is interactive API documentation. Pick an endpoint, then click "Try it out" to test it.',
};

// Jendela "Coba Langsung": menampilkan demo proyek di dalam iframe
export default function DemoModal({ project, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!project) return;
    setLoaded(false);
    setMobile(!!project.demoMobile); // aplikasi HP langsung tampil dalam bingkai ponsel
    const onKey = (e) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose]);

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="demo-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="demo-window glass"
            role="dialog"
            aria-modal="true"
            aria-label={`Demo ${project.title}`}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="demo-bar">
              <span className="win-dots static">
                <i />
                <i />
                <i />
              </span>
              <span className="demo-url mono">{project.demo.replace(/^https?:\/\//, '')}</span>
              <div className="demo-actions">
                <button
                  className={`demo-btn hide-sm${mobile ? ' on' : ''}`}
                  onClick={() => setMobile((m) => !m)}
                  title="View mobile version"
                  aria-label="View mobile version"
                >
                  <Icon name="phone" />
                </button>
                <a className="demo-btn" href={project.demo} target="_blank" rel="noopener" title="Open in a new tab">
                  ↗
                </a>
                <a className="demo-btn" href={project.url} target="_blank" rel="noopener" title="View code on GitHub">
                  {'</>'}
                </a>
                <button className="demo-btn" onClick={onClose} title="Close (Esc)" autoFocus>
                  ✕
                </button>
              </div>
            </div>

            <div className={`demo-stage${mobile ? ' mobile' : ''}`}>
              {!loaded && (
                <div className="demo-loading">
                  <span className="demo-spinner" />
                  <span className="mono small muted">Diving into {project.title}…</span>
                </div>
              )}
              <iframe
                key={project.demo}
                src={project.demo}
                title={project.title}
                allow="camera; microphone; autoplay; clipboard-write; fullscreen"
                onLoad={() => setLoaded(true)}
              />
            </div>

            <p className="demo-hint small muted">
              {project.demoLogin && (
                <>
                  Demo account: <span className="mono demo-cred">{project.demoLogin.email}</span> /{' '}
                  <span className="mono demo-cred">{project.demoLogin.password}</span>
                  <br />
                </>
              )}
              {HINTS[project.demoType] || HINTS.app} If it looks blank,{' '}
              <a href={project.demo} target="_blank" rel="noopener">
                open it in a new tab ↗
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
