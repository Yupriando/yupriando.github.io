import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

// Kartu yang miring 3D mengikuti kursor, dengan kilau cahaya
export default function TiltCard({ max = 8, className = '', children, ...rest }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 220, damping: 20 });
  const sry = useSpring(ry, { stiffness: 220, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.13), transparent 55%)`;

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      className={`tilt ${className}`}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
      <motion.span className="glare" style={{ background: glare }} aria-hidden="true" />
    </motion.div>
  );
}
