/*
 * Mode ringan untuk HP / layar sentuh / layar kecil.
 * Dipakai untuk menurunkan resolusi kanvas, jumlah ikan, dan efek berat.
 */
export const LITE =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

// tandai <html> supaya CSS juga bisa mematikan efek mahal (blur, glow, animasi karang)
if (LITE) document.documentElement.classList.add('lite');

// resolusi kanvas: HP cukup ~1.25× (beban piksel jauh lebih kecil, tetap tajam)
export const canvasDPR = () => Math.min(window.devicePixelRatio || 1, LITE ? 1.25 : 2);
