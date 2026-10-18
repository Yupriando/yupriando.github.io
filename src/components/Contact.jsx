import { motion } from 'framer-motion';
import { profile, socials } from '../data';
import Reveal from './ui/Reveal';
import SectionHead from './ui/SectionHead';
import Icon from './ui/Icon';
import { useToast } from './Toast';
import '../styles/contact.css';

export default function Contact() {
  const toast = useToast();

  // Membuka aplikasi email pengunjung dengan pesan yang sudah terisi
  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nama = data.get('nama');
    const subject = `Halo dari ${nama}`;
    const body = `${data.get('pesan')}\n\n— ${nama} (${data.get('email')})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('📡 Sinyal terkirim! Membuka aplikasi email…');
    e.currentTarget.reset();
  };

  return (
    <section className="zone" id="kontak">
      <div className="container">
        <SectionHead idx="05" zone="zona_hadal · 10.994 m" note="dasar laut terdalam" title="Ayo Terhubung" />

        <div className="contact-grid">
          <div className="contact-info">
            <Reveal as="p" className="lead">
              Selamat, kamu sudah menyelam sampai dasar! 🎉
            </Reveal>
            <Reveal as="p" delay={0.1}>
              Sekarang kamu sudah kenal aku lebih dalam. Punya proyek, tawaran kerja, atau cuma mau ngobrol soal kode dan ikan? Kirim
              sinyal saja, pasti aku balas.
            </Reveal>
            <div className="socials">
              {socials.map((s, i) => (
                <motion.a
                  key={s.name}
                  className="glass social"
                  href={s.href}
                  {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon name={s.icon} />
                  <span>{s.name}</span>
                </motion.a>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <form className="glass contact-form" onSubmit={onSubmit}>
              <div className="form-head mono small">
                <span className="accent">📡 transmit</span> --to {profile.logo}
              </div>
              <label>
                Nama
                <input type="text" name="nama" required placeholder="Nama kamu" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="kamu@email.com" />
              </label>
              <label>
                Pesan
                <textarea name="pesan" rows="4" required placeholder={`Halo ${profile.name}, aku mau ngobrol soal…`} />
              </label>
              <motion.button className="btn btn-primary" type="submit" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}>
                Kirim Sinyal 📡
              </motion.button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
