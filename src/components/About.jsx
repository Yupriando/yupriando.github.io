import { profile } from '../data';
import DiveHelmet from './DiveHelmet';
import useGithubProjects from '../hooks/useGithubProjects';
import Reveal from './ui/Reveal';
import TiltCard from './ui/TiltCard';
import SectionHead from './ui/SectionHead';
import Counter from './ui/Counter';
import '../styles/about.css';
import Icon from './ui/Icon';

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
  // jumlah proyek = repo yang tampil di bagian Projects (live dari GitHub, cadangan: daftar di data.js)
  const { list } = useGithubProjects();
  const repoCount = list.length;
  const demoCount = list.filter((p) => p.demo).length; // sama dengan filter "Try it live" & badge LIVE
  const auto = { github: repoCount, demos: demoCount };

  return (
    <section className="zone" id="about">
      <div className="container">
        <SectionHead idx="01" zone="epipelagic_zone · 200 m" note="sunlight still reaches here" title="About Me" />

        <div className="about-grid">
          <Reveal>
            <TiltCard className="glass about-profile" max={6}>
              <DiveHelmet />
              <h3>{profile.name}</h3>
              <p className="mono muted small">{profile.title}</p>
              <ul className="facts">
                {profile.facts.map(([icon, text]) => (
                  <li key={text}>
                    <Icon name={icon} /> {text}
                  </li>
                ))}
                <li>
                  <span className="dot-online" /> Open to collaboration
                </li>
              </ul>
              <a className="btn btn-small" href={profile.cv} download>
                <Icon name="download" /> Download CV
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
                  <span className="mono small muted">about-me.js</span>
                </div>
                <pre className="mono">
                  <code>
                    <span className="k">const</span> me = {'{\n'}
                    {profile.code.map(([key, value], i) => (
                      <span key={key}>
                        {'  '}
                        <span className="p">{key}</span>: <CodeValue value={value} />
                        {i < profile.code.length - 1 ? ',' : ''}
                        {'\n'}
                      </span>
                    ))}
                    {'};\n'}
                    <span className="c">// psst… try grabbing a fish in the background</span>
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
                {s.text ? (
                  <strong>{s.text}</strong>
                ) : (
                  <Counter to={s.source ? auto[s.source] ?? 0 : s.value} suffix={s.suffix} />
                )}
                <span>{s.label}</span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
