# 🐟 Portofolio Bawah Laut

Web portofolio bertema laut. Pengunjung mulai dari permukaan (kapal + pemancing yang ngoding), lalu menyelam makin dalam sambil mengenal profil, keahlian, proyek, dan pengalaman. Dibuat dengan **React + Vite + Framer Motion + Canvas API**.

## Menjalankan

```bash
npm install      # sekali saja
npm run dev      # mode pengembangan → buka http://localhost:5173
npm run build    # hasil siap upload ada di folder dist/
```

## Mengganti isi

Semua teks, skill, proyek, pengalaman, dan link sosial ada di **`src/data.js`**.

- **Foto profil:** taruh file di `public/` (misalnya `public/foto.jpg`), lalu isi `photo: 'foto.jpg'`.
- **CV:** taruh `cv.pdf` di folder `public/`.
- **Email:** ganti `email` di `profile` (dipakai form kontak).

## Pakai gambar sendiri (ikan, burung, karang, kapal)

1. Taruh gambar di `public/assets/` (PNG transparan / WEBP / SVG). Ikan & burung **menghadap ke kanan**.
2. Daftarkan di **`src/assets.js`**. Semua opsi dijelaskan di file itu.
3. Yang tidak didaftarkan tetap memakai gambar bawaan. Gambar yang gagal dimuat juga otomatis kembali ke bawaan (cek console F12).

Contoh aset siap pakai ada di `public/assets/*/contoh-*.svg`. Hapus `//` di depan baris contoh pada `src/assets.js` untuk mencobanya.

## Struktur

```
src/
├── data.js            ← isi konten (edit di sini)
├── assets.js          ← daftar gambar sendiri (ikan, burung, karang, kapal)
├── depth.js           ← menghitung "kedalaman" dari posisi scroll
├── ocean/
│   ├── engine.js      ← simulasi ikan, interaksi, mini-game memancing
│   ├── species.js     ← daftar spesies per zona kedalaman
│   ├── draw.js        ← cara menggambar tiap spesies
│   └── sky.js         ← burung camar di langit
├── reef/              ← generator terumbu karang (SVG prosedural)
├── hooks/             ← efek mengetik
├── components/        ← satu file .jsx per bagian halaman
│   └── ui/            ← komponen kecil (Reveal, TiltCard, dll.)
└── styles/            ← satu file .css per bagian halaman
```

## Interaksi tersembunyi

- 🎣 Tarik kail pancing → ikan mendekati umpan → kalau nyangkut, klik kail/ikannya untuk menarik ke kapal
- 🐦 Klik burung camar → dia menyelam menangkap ikan (dekati kursor → burung kaget)
- 🪸 Klik terumbu karang → bergoyang & keluar gelembung (ikan badut di anemon akan bersembunyi)
- 🐡 Dekati ikan buntal → dia menggembung
- Tahan & seret ikan untuk memegangnya, lepas untuk melempar
- Klik air kosong untuk memberi makan ikan
- Tangkap ikan ASCII hijau `><(((°>` untuk mem-fix bug 🐛
- Klik kapal untuk mendengar celetukan si pemancing
- Di zona dalam, kursor jadi senter 🔦
- Buka peti harta karun di dasar laut
- Buka DevTools console 👀
