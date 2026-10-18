import { motion } from 'framer-motion';
import { learning, skillGroups, sonarBlips } from '../data';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import TiltCard from './ui/TiltCard';
import '../styles/skills.css';

const SWEEP_SECONDS = 4;

function Sonar() {
  const total = skillGroups.reduce((n, g) => n + g.items.length, 0);
  return (
    <Reveal className="sonar-wrap">
      <div className="sonar">
        <span className="ring" />
        <span className="ring" />
        <span className="ring" />
        <span className="axis-h" />
        <span className="axis-v" />
        <div className="sonar-sweep" />
        {sonarBlips.map(([label, angle, r]) => {
          const rad = (angle * Math.PI) / 180;
          // blip berkedip tepat saat garis sapuan (mulai dari atas, searah jarum jam) melewatinya
          const delay = (((angle + 90 + 360) % 360) / 360) * SWEEP_SECONDS;
          return (
            <span
              key={label}
              className="blip mono"
              style={{
                left: `${50 + Math.cos(rad) * r * 50}%`,
                top: `${50 + Math.sin(rad) * r * 50}%`,
                animationDelay: `${delay}s`,
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
      <p className="sonar-caption mono small">
        sonar.scan() → <span className="accent">{total} skill terdeteksi</span>
      </p>
    </Reveal>
  );
}

export default function Skills() {
  return (
    <section className="zone" id="keahlian">
      <div className="container">
        <SectionHead idx="02" zone="zona_mesopelagik · 1.000 m" note="senja abadi" title="Keahlian" />

        <div className="skills-grid">
          <Sonar />

          <div className="skill-cats">
            {skillGroups.map((group, gi) => (
              <Reveal key={group.name} delay={gi * 0.1}>
                <TiltCard className="glass skill-cat" max={5}>
                  <h3>
                    <span className="ico">{group.icon}</span> {group.name}
                  </h3>
                  <ul className="skill-list">
                    {group.items.map(([name, level], i) => (
                      <li key={name}>
                        <div className="sk-row">
                          <span>{name}</span>
                          <span className="mono">{level}%</span>
                        </div>
                        <div className="bar">
                          <motion.i
                            initial={{ width: 0 }}
                            whileInView={{ width: `${level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.4, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="learning">
          <span className="mono small">
            <span className="accent">$</span> npm install --sedang-dipelajari
          </span>
          <div className="chips">
            {learning.map((item, i) => (
              <motion.span
                key={item}
                className="chip"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 18 }}
                whileHover={{ y: -4 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
