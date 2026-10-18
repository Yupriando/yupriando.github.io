import { useEffect, useRef } from 'react';
import { subscribe, zoneName } from '../depth';
import '../styles/depth-meter.css';

// Pengukur kedalaman di sisi kanan (diperbarui langsung ke DOM agar ringan)
export default function DepthMeter() {
  const rootRef = useRef(null);
  const valueRef = useRef(null);
  const zoneRef = useRef(null);

  useEffect(
    () =>
      subscribe(({ depth, progress }) => {
        rootRef.current?.style.setProperty('--p', `${(progress * 100).toFixed(2)}%`);
        if (valueRef.current) valueRef.current.textContent = Math.round(depth).toLocaleString('id-ID');
        if (zoneRef.current) zoneRef.current.textContent = zoneName(depth);
      }),
    []
  );

  return (
    <aside className="depth-meter" ref={rootRef} aria-hidden="true">
      <div className="dm-track">
        <div className="dm-line" />
        <svg className="dm-hook" viewBox="0 0 16 24">
          <path d="M8 0v14a4 4 0 1 1-6-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="dm-readout">
        <strong>
          <span ref={valueRef}>0</span> m
        </strong>
        <small ref={zoneRef}>Permukaan</small>
      </div>
    </aside>
  );
}
