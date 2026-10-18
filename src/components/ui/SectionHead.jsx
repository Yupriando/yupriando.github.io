import { motion } from 'framer-motion';
import Reveal from './Reveal';

// Judul section: label zona (gaya komentar kode) + nomor + judul
export default function SectionHead({ idx, zone, note, title }) {
  return (
    <Reveal className="zone-head">
      <span className="zone-tag mono">
        // {zone} · <em>{note}</em>
      </span>
      <h2 className="section-title">
        <span className="idx mono">{idx}.</span> {title}
      </h2>
      <motion.span
        className="title-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </Reveal>
  );
}
