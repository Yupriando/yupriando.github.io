/*
 * Pelacak kedalaman: mengubah posisi scroll menjadi "meter di bawah laut".
 * Dipakai bersama oleh pengukur kedalaman dan kanvas ikan.
 */

// [selector section, kedalaman (m) saat section itu mencapai tengah layar]
const ANCHORS = [
  ['#tentang', 200],
  ['#keahlian', 1000],
  ['#proyek', 4000],
  ['#pengalaman', 6000],
  ['#kontak', 8500],
];
export const MAX_DEPTH = 10994; // Challenger Deep

let points = [];
let seaTop = 0;
let state = { depth: 0, progress: 0 };
const listeners = new Set();

export function measure() {
  const sea = document.querySelector('.sea');
  if (!sea) return;
  const sy = window.scrollY;
  seaTop = sea.getBoundingClientRect().top + sy;
  points = [[seaTop, 0]];
  for (const [sel, d] of ANCHORS) {
    const el = document.querySelector(sel);
    if (el) points.push([el.getBoundingClientRect().top + sy, d]);
  }
  points.push([document.documentElement.scrollHeight, MAX_DEPTH]);
}

function compute() {
  const sy = window.scrollY;
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  const progress = Math.min(1, Math.max(0, sy / max));
  // titik baca bergeser ke bawah layar saat mendekati dasar, supaya dasar = kedalaman maksimum
  const y = sy + vh * (0.5 + 0.5 * progress);
  let depth = 0;
  if (points.length && y > points[0][0]) {
    depth = MAX_DEPTH;
    for (let i = 0; i < points.length - 1; i++) {
      const [y0, d0] = points[i];
      const [y1, d1] = points[i + 1];
      if (y < y1) {
        depth = d0 + (d1 - d0) * ((y - y0) / Math.max(1, y1 - y0));
        break;
      }
    }
  }
  state = { depth, progress };
  listeners.forEach((fn) => fn(state));
}

export const getDepth = () => state.depth;
export const getSurfaceY = () => seaTop - window.scrollY;

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

export function zoneName(depth) {
  if (depth < 1) return 'Permukaan';
  if (depth < 200) return 'Epipelagik';
  if (depth < 1000) return 'Mesopelagik';
  if (depth < 4000) return 'Batipelagik';
  if (depth < 6000) return 'Abisopelagik';
  return 'Hadalpelagik';
}

export function startDepthTracking() {
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      compute();
    });
  };
  const remeasure = () => {
    measure();
    schedule();
  };
  remeasure();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  const ro = new ResizeObserver(remeasure);
  ro.observe(document.body);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('load', remeasure);
    ro.disconnect();
  };
}
