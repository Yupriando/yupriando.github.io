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
  const [pane, setPane] = useState(0); // tampilan terbagi di layar sempit: panel yang sedang dilihat
  const [real, setReal] = useState(false); // panel layar besar: demo langsung / foto layar di acara sungguhan
  const split = project?.demoSplit; // dua halaman berdampingan (mis. kamera HP + layar besar)

  useEffect(() => {
    if (!project) return;
    setLoaded(false);
    setMobile(!!project.demoMobile); // aplikasi HP langsung tampil dalam bingkai ponsel
    setPane(0);
    setReal(false);
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
                {!split && <button
                  className={`demo-btn hide-sm${mobile ? ' on' : ''}`}
                  onClick={() => setMobile((m) => !m)}
                  title="View mobile version"
                  aria-label="View mobile version"
                >
                  <Icon name="phone" />
                </button>}
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

            {split ? (
              <div className="demo-stage split">
                {!loaded && (
                  <div className="demo-loading">
                    <span className="demo-spinner" />
                    <span className="mono small muted">Diving into {project.title}…</span>
                  </div>
                )}
                {/* layar sempit: tab untuk berpindah panel (kedua halaman tetap berjalan) */}
                <div className="split-tabs" role="tablist">
                  {[project.demoLabel || 'App', split.label].map((label, i) => (
                    <button key={label} role="tab" aria-selected={pane === i} className={pane === i ? 'on' : ''} onClick={() => setPane(i)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className={`split-pane phone${pane === 0 ? ' on' : ''}`}>
                  <span className="split-label mono">{project.demoLabel || 'App'}</span>
                  <iframe
                    key={project.demo}
                    src={project.demo}
                    title={`${project.title}: ${project.demoLabel || 'app'}`}
                    allow="camera; microphone; autoplay; clipboard-write; fullscreen"
                    onLoad={() => setLoaded(true)}
                  />
                </div>
                <div className={`split-pane wide${pane === 1 ? ' on' : ''}`}>
                  <span className="split-label mono">{split.label}</span>
                  {split.real && (
                    <div className="split-switch" role="tablist" aria-label="Big screen view">
                      <button role="tab" aria-selected={!real} className={real ? '' : 'on'} onClick={() => setReal(false)}>
                        Live demo
                      </button>
                      <button role="tab" aria-selected={real} className={real ? 'on' : ''} onClick={() => setReal(true)}>
                        Real event
                      </button>
                    </div>
                  )}
                  {/* iframe demo tetap berjalan saat foto acara ditampilkan (foto yang dikirim tetap masuk) */}
                  <iframe
                    key={split.url}
                    src={split.url}
                    title={`${project.title}: ${split.label}`}
                    allow="autoplay; fullscreen"
                    style={real ? { visibility: 'hidden' } : undefined}
                  />
                  {split.real && real && (
                    <figure className="split-real">
                      <img src={split.real.img} alt={split.real.alt} />
                      <figcaption>{split.real.caption}</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            ) : (
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
            )}

            <p className="demo-hint small muted">
              {project.demoLogin && (
                <>
                  Demo account: <span className="mono demo-cred">{project.demoLogin.email}</span> /{' '}
                  <span className="mono demo-cred">{project.demoLogin.password}</span>
                  <br />
                </>
              )}
              {project.demoNote ? `${project.demoNote} ` : `${HINTS[project.demoType] || HINTS.app} `}If it looks blank,{' '}
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
