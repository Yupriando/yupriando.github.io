import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { startDepthTracking } from './depth';
import { ToastProvider } from './components/Toast';
import OceanCanvas from './components/OceanCanvas';
import Nav from './components/Nav';
import DepthMeter from './components/DepthMeter';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Seafloor from './components/Seafloor';
import CatchBadge from './components/CatchBadge';
import Reef from './reef/Reef';

export default function App() {
  useEffect(() => startDepthTracking(), []);

  useEffect(() => {
    // pesan rahasia untuk sesama developer yang membuka DevTools 👀
    console.log(
      '%c><(((°>  Halo, developer!',
      'font: 600 16px monospace; color:#5ce1e6; background:#04142c; padding:6px 10px; border-radius:6px'
    );
    console.log('%cKamu menemukan ikan di console. Mau ngobrol? Scroll ke dasar laut 🌊', 'color:#9db8cc');
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <OceanCanvas />
        <Nav />
        <DepthMeter />
        <CatchBadge />
        <Hero />
        <main className="ocean-main">
          <Reef variant="shallow" seed={7} className="reef-top" />
          <About />
          <Reef variant="twilight" seed={21} />
          <Skills />
          <Projects />
          <Reef variant="midnight" seed={42} />
          <Experience />
          <Contact />
        </main>
        <Seafloor />
      </ToastProvider>
    </MotionConfig>
  );
}
