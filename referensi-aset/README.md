# 🎨 Referensi Aset untuk Tracing

Semua aset bawaan web portofolio ini diekspor langsung dari kode gambarnya.
Folder ini **tidak ikut ter-upload** ke web karena berada di luar `public/`. Silakan di-tracing dengan style kamu sendiri.

## Cara pakai
1. Buka file di aplikasi gambar (Figma, Illustrator, Inkscape, Procreate, Krita, dll.).
2. Tracing di layer baru. **Pertahankan ukuran kanvas & posisi**, supaya gerakan dan titik-titiknya tetap pas.
3. Simpan hasilnya (PNG transparan / SVG) ke `public/assets/...`, lalu daftarkan di `src/assets.js`.

---

## 🐟 Ikan: `ikan/`
Tiap ikan punya 2 file:
- `<id>.png`: satu pose (untuk gambar statis)
- `<id>-sheet.png`: **sprite sheet 4 frame**, urutannya ekor lurus → atas → lurus → bawah (siap animasi)

Semua ikan menghadap **ke kanan**. Frame sudah sejajar, jadi kepala & badan tidak bergeser antar frame. Cukup tracing ekor/sirip yang berbeda.

| id | Nama | Zona | Ukuran di web | `scale` disarankan |
|---|---|---|---|---|
| `clown` | Ikan Badut | permukaan | 24–32 px | 1.34 |
| `tang` | Ikan Dori | permukaan | 30–40 px | 1.42 |
| `yellow` | Ikan Botana Kuning | permukaan | 14–20 px | 1.42 |
| `angel` | Ikan Angel | permukaan | 28–36 px | 1.49 |
| `butterfly` | Ikan Kepe-kepe | permukaan | 22–28 px | 1.46 |
| `parrot` | Ikan Kakatua | permukaan | 36–46 px | 1.41 |
| `puffer` | Ikan Buntal | permukaan | 26–32 px | 0.98 |
| `sardine` | Ikan Teri | permukaan | 8–11 px | 1.35 |
| `turtle` | Penyu | permukaan | 64–80 px | 1.1 |
| `silver` | Ikan Perak | senja | 18–26 px | 1.36 |
| `tuna` | Ikan Tuna | senja | 50–64 px | 1.37 |
| `barracuda` | Ikan Barakuda | senja | 60–76 px | 1.41 |
| `shark` | Hiu | senja | 120–160 px | 1.23 |
| `lantern` | Ikan Lentera | gelap | 18–26 px | 1.39 |
| `hatchet` | Ikan Kapak | gelap | 16–22 px | 1.49 |
| `viper` | Ikan Viper | gelap | 40–52 px | 1.4 |
| `squid` | Cumi Kunang | gelap | 30–40 px | 1.14 |
| `angler` | Ikan Sungut Ganda | palung | 48–66 px | 1.89 |
| `dumbo` | Gurita Dumbo | palung | 34–44 px | 1.24 |
| `eel` | Belut Pelikan | palung | 100–130 px | 1.16 |
| `ascii` | Bug | semua zona dalam | 46–56 px | 1.87 |

> **`scale`** membuat hasil tracing tampil seukuran ikan bawaan, karena gambar ekspor sudah termasuk ekor & sirip.
> Untuk `puffer`, ada juga `puffer-menggembung` sebagai referensi. Cukup tracing yang biasa, karena web otomatis memperbesarnya saat menggembung.

Contoh daftar di `src/assets.js`. Ganti nama file sesuai hasil tracing-mu dan hapus `//` untuk ikan yang sudah selesai:
```js
  fishImages: {
    // clown: { src: 'assets/fish/clown-sheet.png', frames: 4, fps: 8, scale: 1.34 },
    // tang: { src: 'assets/fish/tang-sheet.png', frames: 4, fps: 8, scale: 1.42 },
    // turtle: { src: 'assets/fish/turtle-sheet.png', frames: 4, fps: 6, scale: 1.1 },
    // shark: { src: 'assets/fish/shark-sheet.png', frames: 4, fps: 6, scale: 1.23 },
    // ...dan seterusnya, pakai nilai scale dari tabel di atas
  },
```
Kalau kamu hanya menggambar 1 pose (tanpa animasi), hapus `frames` dan `fps`.

## 🐦 Burung: `burung/`
- `camar-1.png` … `camar-4.png`: 4 frame kepakan (1 = sayap paling atas, 4 = sayap paling bawah)
- `camar-sheet.png`: keempat frame dalam satu gambar (untuk referensi)
- `camar-melayang.png`, `camar-menyelam.png`: pose tambahan (referensi saja)

```js
  bird: {
    frames: ['assets/bird/camar-1.png', 'assets/bird/camar-2.png', 'assets/bird/camar-3.png', 'assets/bird/camar-4.png'],
    scale: 1,
  },
```

## ⛵ Kapal & pemancing: `kapal/` (SVG + PNG)
- `kapal-lengkap`: kapal + pemancing + kucing. Di web, kapal kustom dipakai sebagai **satu gambar utuh**.
- `kapal-tanpa-pemancing`, `pemancing`, `kucing`: bagian terpisah, supaya enak di-tracing per layer.

Kalau kamu tracing `kapal-lengkap` **dengan ukuran kanvas yang sama**, pakai nilai yang sudah dihitung ini:
```js
  boat: {
    src: 'assets/boat/kapal.png',
    scale: 1.06,
    waterline: 0.859,
    rodTip: [0.1, 0.036],
    rodTipBent: [0.076, 0.259],
    bucket: [0.499, 0.627],
  },
```
- **waterline**: garis air. Bagian bawah lambung yang biru gelap akan tertutup ombak.
- **rodTip**: titik abu-abu kecil di ujung joran, tempat tali pancing tersambung.
- **bucket**: ember, tujuan ikan hasil pancingan.

## 🪸 Terumbu karang: `karang/<zona>/` (SVG + PNG)
Dua contoh per jenis, per zona:
- **shallow** (dangkal): branching, table, tubes, brain, polyps, sponge, kelp, fan, star, urchin, anemone, shell
- **twilight** (senja): tubes, branching, sponge, kelp, fan, polyps, anemone, urchin, brain, star, shell
- **midnight** (gelap): bamboo, glass, polyps, seapen, brittle, anemone
- **abyss** (dasar laut): seapen, vent, glass, bamboo, tubeworms, anemone, star, brittle

Bagian **bawah** gambar = dasar yang menempel ke batu. Daftarkan dengan ukuran kotak sekitar 60–100:
```js
  coral: {
    replaceDefault: false,
    items: [
      { src: 'assets/coral/karang-bercabang.png', width: 80, height: 90, zones: ['shallow'] },
    ],
  },
```
> Efek cahaya (glow) pada karang laut dalam dibuat oleh CSS, jadi tidak ikut di file ekspor dan tidak otomatis diterapkan ke gambar sendiri. Kalau ingin karangmu bercahaya, gambar glow-nya langsung di file.

## 🌊 Lainnya (referensi saja)
- `ubur-ubur/`: 3 warna, sprite sheet 4 frame denyutan
- `raksasa/`: siluet paus & pari manta yang lewat di latar

Dua kelompok ini belum bisa diganti lewat `src/assets.js`.
