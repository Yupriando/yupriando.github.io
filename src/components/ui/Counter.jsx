import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

// Angka yang menghitung naik saat terlihat
export default function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    if (!inView) return;
    // kalau angkanya berubah (mis. data GitHub baru tiba), lanjut dari angka sekarang, tidak mulai dari 0
    const controls = animate(current.current, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        current.current = v;
        setValue(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <strong ref={ref}>
      {value.toLocaleString('en-US')}
      {suffix}
    </strong>
  );
}
