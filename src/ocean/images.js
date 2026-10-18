/*
 * Pemuat gambar aset (dengan cache). Dipakai kanvas laut, burung, karang, dan kapal.
 */
const cache = new Map();

// 'assets/ikan.png' → path yang benar baik saat dev maupun setelah build
export const assetUrl = (src) => (/^(https?:|data:|blob:|\/)/.test(src) ? src : `${import.meta.env.BASE_URL}${src}`);

export function loadImage(src) {
  if (!src) return null;
  if (!cache.has(src)) {
    const img = new Image();
    img.decoding = 'async';
    img.onerror = () =>
      console.warn(`[aset] Gagal memuat "${src}". Cek nama file & pastikan ada di folder public/${src}. Gambar bawaan dipakai.`);
    img.src = assetUrl(src);
    cache.set(src, img);
  }
  return cache.get(src);
}

export const isReady = (img) => !!img && img.complete && img.naturalWidth > 0;
export const isBroken = (img) => !!img && img.complete && img.naturalWidth === 0;
