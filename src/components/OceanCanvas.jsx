import { useEffect, useRef } from 'react';
import { createOcean } from '../ocean/engine';
import { useToast } from './Toast';

// Kanvas latar berisi ikan interaktif (logikanya ada di ocean/engine.js)
export default function OceanCanvas() {
  const ref = useRef(null);
  const toast = useToast();

  useEffect(() => createOcean(ref.current, { toast }), [toast]);

  return <canvas ref={ref} className="ocean-canvas" aria-hidden="true" />;
}
