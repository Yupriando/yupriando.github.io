import { profile } from '../data';
import Reveal from './ui/Reveal';
import TiltCard from './ui/TiltCard';
import SectionHead from './ui/SectionHead';
import Counter from './ui/Counter';
import '../styles/about.css';

// Menampilkan nilai JS dengan pewarnaan sintaks sederhana
function CodeValue({ value }) {
  if (Array.isArray(value)) {
    return (
      <>
        [
        {value.map((v, i) => (
          <span key={i}>
            <CodeValue value={v} />
            {i < value.length - 1 && ', '}
          </span>
        ))}
        ]
      </>
    );
  }
  if (typeof value === 'string') return <span className="s">"{value}"</span>;
  return <span className="k">{String(value)}</span>;
}

export default function About() {
  return (
    <section className="zone" id="tentang">
      <div className="container">
        <SectionHead idx="01" zone="zona_epipelagik · 200 m" note="cahaya matahari masih tembus" title="Tentang Aku" />

        <div className="about-grid">
          <Reveal>
            <TiltCard className="glass about-profile" max={6}>
              <div className="porthole">
                <div className="porthole-inner">
                  {profile.photo ? <img src={profile.photo} alt={profile.name} /> : <span>{profile.initial}</span>}
                </div>
              </div>
              <h3>{profile.name}</h3>
              <p className="mono muted small">{profile.title}</p>
              <ul className="facts">
                {profile.facts.map(([icon, text]) => (
                  <li key={text}>
                    <span>{icon}</span> {text}
                  </li>
                ))}
                <li>
                  <span className="dot-online" /> Terbuka untuk kolaborasi
                </li>
              </ul>
              <a className="btn btn-small" href={profile.cv} download>
                Unduh CV ⬇
              </a>
            </TiltCard>
          </Reveal>

          <div className="about-text">
            <Reveal as="p" className="lead" delay={0.05}>
              {profile.aboutLead}
            </Reveal>
            <Reveal as="p" delay={0.15}>
              {profile.aboutText}
            </Reveal>
            <Reveal delay={0.25}>
              <div className="glass code-card">
                <div className="code-head">
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="mono small muted">tentang-aku.js</span>
                </div>
                <pre className="mono">
                  <code>
                    <span className="k">const</span> aku = {'{\n'}
                    {profile.code.map(([key, value], i) => (
                      <span key={key}>
                        {'  '}
                        <span className="p">{key}</span>: <CodeValue value={value} />
                        {i < profile.code.length - 1 ? ',' : ''}
                        {'\n'}
                      </span>
                    ))}
                    {'};\n'}
                    <span className="c">// psst… coba pegang ikan di latar belakang 🐟</span>
                  </code>
                </pre>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="stats">
          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <TiltCard className="glass stat" max={10}>
                {s.text ? <strong>{s.text}</strong> : <Counter to={s.value} suffix={s.suffix} />}
                <span>{s.label}</span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
