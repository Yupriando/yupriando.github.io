/*
 * Daftar spesies penghuni laut + zona kedalaman tempat mereka muncul.
 *
 * Properti umum:
 *  name     nama yang tampil saat tertangkap
 *  size     [min, max] panjang badan (px)
 *  speed    kecepatan dasar
 *  h        tinggi badan relatif terhadap panjang
 *  pattern  corak badan (lihat draw.js)
 *  special  bentuk khusus (penyu, hiu, buntal, dll.)
 *  school   [min, max] jumlah ikan dalam satu gerombolan
 *  weight   bobot hitungan populasi (ikan kecil bergerombol dihitung lebih ringan)
 *  bold     tidak gampang kabur dari kursor
 *  protect  satwa dilindungi → dilepas lagi kalau terpancing
 *  upright  tidak berputar mengikuti arah renang
 */
import { assets } from '../assets';
import { loadImage } from './images';

export const SPECIES = {
  /* ---------- zona 0: terumbu karang dangkal ---------- */
  clown: { name: 'Ikan Badut', size: [24, 32], speed: 1.2, h: 0.44, body: '#ff7a2f', belly: '#ffb37a', fin: '#ff5a1f', pattern: 'clown', tail: 'round' },
  tang: { name: 'Ikan Dori', size: [30, 40], speed: 1.5, h: 0.56, body: '#2f6bff', belly: '#5d8dff', fin: '#1b3fae', tailColor: '#ffd23f', pattern: 'tang' },
  yellow: { name: 'Ikan Botana Kuning', size: [14, 20], speed: 1.8, h: 0.55, body: '#ffd23f', belly: '#fff1a8', fin: '#f5a524', school: [3, 6] },
  angel: { name: 'Ikan Angel', size: [28, 36], speed: 1.0, h: 0.85, body: '#ffe066', belly: '#fff4b8', fin: '#3a86ff', tailColor: '#3a86ff', pattern: 'angel', dorsal: 'tall', rare: true },
  butterfly: { name: 'Ikan Kepe-kepe', size: [22, 28], speed: 1.2, h: 0.72, body: '#fff3d6', belly: '#ffffff', fin: '#ffb703', tailColor: '#ffb703', pattern: 'butterfly' },
  parrot: { name: 'Ikan Kakatua', size: [36, 46], speed: 1.1, h: 0.46, body: '#2ec4b6', belly: '#a8f0e6', fin: '#ff70a6', tailColor: '#ff70a6', pattern: 'parrot', tail: 'fork' },
  puffer: { name: 'Ikan Buntal', size: [26, 32], speed: 0.8, special: 'puffer', body: '#e9c46a', belly: '#fff8e1', fin: '#d4a373', rare: true, hit: 0.5 },
  sardine: { name: 'Ikan Teri', size: [8, 11], speed: 2.4, h: 0.28, body: '#7fa7c9', belly: '#e8f4ff', fin: '#5b84a8', school: [12, 20], shine: true, weight: 0.25, tail: 'fork' },
  turtle: { name: 'Penyu', size: [64, 80], speed: 0.6, special: 'turtle', protect: true, bold: true, hit: 0.45 },

  /* ---------- zona 1: senja ---------- */
  silver: { name: 'Ikan Perak', size: [18, 26], speed: 2, h: 0.32, body: '#8fb8d0', belly: '#e3f2fa', fin: '#6f9bb6', school: [4, 8], shine: true, weight: 0.5, tail: 'fork' },
  tuna: { name: 'Ikan Tuna', size: [50, 64], speed: 2.2, h: 0.34, body: '#1d3557', belly: '#c9d6df', fin: '#ffd166', tail: 'fork', pattern: 'finlets' },
  barracuda: { name: 'Ikan Barakuda', size: [60, 76], speed: 1.8, h: 0.17, nose: 0.6, body: '#6c8a9b', belly: '#dfe7ec', fin: '#4a6274', tail: 'fork', pattern: 'bars', bold: true },
  shark: { name: 'Hiu', size: [120, 160], speed: 1.1, special: 'shark', protect: true, bold: true, hit: 0.32 },

  /* ---------- zona 2: tengah malam (bercahaya) ---------- */
  lantern: { name: 'Ikan Lentera', size: [18, 26], speed: 1.4, h: 0.38, body: '#1d2b4a', belly: '#2c3f66', fin: '#152039', glow: 'lantern', school: [3, 6], weight: 0.6 },
  hatchet: { name: 'Ikan Kapak', size: [16, 22], speed: 1.3, h: 0.85, body: '#aab7c4', belly: '#e0e7ee', fin: '#7a8a99', glow: 'hatchet', school: [2, 4], eye: 1.6 },
  viper: { name: 'Ikan Viper', size: [40, 52], speed: 1, h: 0.2, nose: 0.55, body: '#14213d', belly: '#22335a', fin: '#0d1528', glow: 'viper', pattern: 'fangs', bold: true },
  squid: { name: 'Cumi Kunang', size: [30, 40], speed: 1.2, special: 'squid', glow: 'squid', hit: 0.5 },

  /* ---------- zona 3: palung ---------- */
  angler: { name: 'Ikan Sungut Ganda', size: [48, 66], speed: 0.7, h: 0.62, body: '#2a1f2e', belly: '#3b2c40', fin: '#1c141f', glow: 'angler', pattern: 'angler', bold: true },
  dumbo: { name: 'Gurita Dumbo', size: [34, 44], speed: 0.5, special: 'dumbo', upright: true, hit: 0.6 },
  eel: { name: 'Belut Pelikan', size: [100, 130], speed: 0.9, special: 'eel', glow: 'eel', bold: true, hit: 0.25 },

  /* ---------- "bug" — ada di semua zona dalam ---------- */
  ascii: { name: 'Bug', size: [46, 56], speed: 1.5, special: 'ascii', glow: 'ascii', upright: true, hit: 0.9 },
};

// Daftar acak per zona (nama yang muncul lebih sering = lebih umum)
export const ZONE_FISH = [
  ['clown', 'clown', 'clown', 'tang', 'tang', 'yellow', 'yellow', 'angel', 'butterfly', 'butterfly', 'parrot', 'parrot', 'puffer', 'sardine', 'sardine', 'turtle'],
  ['silver', 'silver', 'silver', 'sardine', 'tuna', 'tuna', 'barracuda', 'barracuda', 'tang', 'ascii', 'shark'],
  ['lantern', 'lantern', 'lantern', 'hatchet', 'hatchet', 'viper', 'viper', 'squid', 'squid', 'ascii', 'ascii'],
  ['angler', 'angler', 'lantern', 'lantern', 'dumbo', 'dumbo', 'eel', 'viper', 'ascii'],
];

// Hewan besar: maksimal satu di layar
export const SOLO = new Set(['turtle', 'shark', 'eel']);

export const ZONE_JELLY = [1, 4, 5, 3];

export const zoneIndex = (d) => (d < 200 ? 0 : d < 1000 ? 1 : d < 4000 ? 2 : 3);

/* ------------------------------------------------------------------ */
/*  Pasang aset gambar dari src/assets.js (dipanggil sekali)           */
/* ------------------------------------------------------------------ */
let applied = false;

export function applyFishAssets() {
  if (applied) return;
  applied = true;

  // gambar pengganti untuk spesies bawaan
  for (const [id, cfg] of Object.entries(assets.fishImages || {})) {
    const sp = SPECIES[id];
    if (!sp) {
      console.warn(`[aset] Spesies "${id}" tidak dikenal. Lihat daftar id di src/assets.js.`);
      continue;
    }
    if (!cfg?.src) continue;
    Object.assign(sp, imageProps(cfg));
    if (cfg.name) sp.name = cfg.name;
  }

  // spesies baru
  for (const nf of assets.newFish || []) {
    if (!nf?.id || !nf.src) {
      console.warn('[aset] Ikan baru butuh "id" dan "src".', nf);
      continue;
    }
    if (SPECIES[nf.id]) console.warn(`[aset] id "${nf.id}" sudah dipakai, spesies lama ditimpa.`);
    SPECIES[nf.id] = {
      name: nf.name || nf.id,
      size: nf.size || [30, 40],
      speed: nf.speed || 1.2,
      h: 0.45,
      body: '#ffb347',
      belly: '#ffe0a3',
      fin: '#ff8c1a',
      school: nf.school || undefined,
      weight: nf.school ? 0.5 : 1,
      rare: !!nf.rare,
      protect: !!nf.protect,
      bold: !!nf.protect,
      hit: 0.55,
      custom: true,
      ...imageProps(nf),
    };
    const chance = Math.max(1, Math.round(nf.chance || 2));
    for (const z of nf.zones || [0]) {
      if (!ZONE_FISH[z]) {
        console.warn(`[aset] Zona ${z} tidak ada (pakai 0–3).`);
        continue;
      }
      for (let i = 0; i < chance; i++) ZONE_FISH[z].push(nf.id);
    }
  }
}

function imageProps(cfg) {
  return {
    img: loadImage(cfg.src),
    imgScale: cfg.scale || 1,
    frames: Math.max(1, cfg.frames || 1),
    fps: cfg.fps || 8,
  };
}
