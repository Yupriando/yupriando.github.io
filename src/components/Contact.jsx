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
    const subject = `Hello from ${nama}`;
    const body = `${data.get('pesan')}\n\n— ${nama} (${data.get('email')})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast('📡 Signal sent! Opening your email app…');
    e.currentTarget.reset();
  };

  return (
    <section className="zone" id="contact">
      <div className="container">
        <SectionHead idx="05" zone="hadal_zone · 10,994 m" note="the deepest seafloor" title="Let's Connect" />

        <div className="contact-grid">
          <div className="contact-info">
            <Reveal as="p" className="lead">
              Congrats, you made it all the way to the bottom! 🎉
            </Reveal>
            <Reveal as="p" delay={0.1}>
              Now you know me a little deeper. Got a project, a job offer, or just want to chat about code and fish? Send a
              signal, and I'll definitely reply.
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
                <span className="accent"><Icon name="antenna" /> transmit</span> --to {profile.logo}
              </div>
              <label>
                Name
                <input type="text" name="nama" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input type="email" name="email" required placeholder="you@email.com" />
              </label>
              <label>
                Message
                <textarea name="pesan" rows="4" required placeholder={`Hi ${profile.name}, I'd like to talk about…`} />
              </label>
              <motion.button className="btn btn-primary" type="submit" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}>
                Send Signal <Icon name="send" />
              </motion.button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
