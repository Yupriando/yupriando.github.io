/*
 * ==========================================================
 *  ASET GAMBAR SENDIRI
 * ==========================================================
 *  1. Taruh file gambar di folder  public/assets/...
 *  2. Daftarkan di bawah ini (path ditulis TANPA "public/").
 *  3. Yang tidak didaftarkan tetap memakai gambar bawaan.
 *
 *  Format: PNG transparan, WEBP, atau SVG.
 *  Ikan & burung harus MENGHADAP KE KANAN (dibalik otomatis saat ke kiri).
 *  Kalau gambar gagal dimuat, muncul peringatan di console browser (F12).
 *
 *  Contoh aset sudah ada di public/assets/ (file "contoh-*.svg").
 *  Hapus tanda // di depan baris contoh untuk mencobanya.
 * ==========================================================
 */

export const assets = {
  /* ------------------------------------------------------------
   * 1) GANTI GAMBAR IKAN BAWAAN
   *    Kunci = id spesies. Daftar id:
   *    zona permukaan : clown, tang, yellow, angel, butterfly, parrot, puffer, sardine, turtle
   *    zona senja     : silver, tuna, barracuda, shark
   *    zona gelap     : lantern, hatchet, viper, squid
   *    zona palung    : angler, dumbo, eel
   *    semua zona     : ascii (ikan "bug")
   *
   *    Opsi: src (wajib), scale (perbesar/perkecil, default 1),
   *          frames + fps (kalau gambarnya sprite sheet horizontal),
   *          name (ganti nama yang tampil saat terpancing)
   * ------------------------------------------------------------ */
  fishImages: {
    clown: { src: 'assets/fish/badut.png', scale: 1.35 },
    tang: { src: 'assets/fish/dori.png', scale: 1.42 },
    angel: { src: 'assets/fish/angel.png', scale: 1.5 },
    shark: { src: 'assets/fish/hiu.png', scale: 1.23 },
    eel: { src: 'assets/fish/belut.png', scale: 1.16, name: 'Belut Laut' },
    dumbo: { src: 'assets/fish/dumbo.png', scale: 1.24 },
    // yellow: { src: 'assets/fish/kuning-sheet.png', frames: 4, fps: 8 },
  },

  /* ------------------------------------------------------------
   * 2) TAMBAH SPESIES IKAN BARU
   *    id       : nama unik (huruf kecil, tanpa spasi)
   *    name     : nama yang tampil saat terpancing
   *    src      : gambar
   *    size     : [min, max] panjang ikan dalam px
   *    speed    : kecepatan renang (1 = santai, 2 = cepat)
   *    zones    : kedalaman tempat muncul: 0 permukaan, 1 senja, 2 gelap, 3 palung
   *    chance   : seberapa sering muncul (1 = jarang, 3 = sering)
   *    school   : [min, max] kalau berenang bergerombol, contoh [4, 8]
   *    rare     : true → muncul label "✨ Langka!" saat terpancing
   *    protect  : true → satwa dilindungi, dilepas lagi kalau terpancing
   * ------------------------------------------------------------ */
  newFish: [
    // { id: 'koi', name: 'Ikan Koi', src: 'assets/fish/contoh-koi.svg', size: [34, 46], speed: 1.1, zones: [0], chance: 3, rare: true },
  ],

  /* ------------------------------------------------------------
   * 3) BURUNG CAMAR
   *    frames : 1 gambar, atau beberapa gambar posisi sayap untuk animasi kepakan
   *             (urutan: frame pertama = sayap paling atas, frame terakhir = sayap paling bawah)
   *    scale  : ukuran (default 1)
   * ------------------------------------------------------------ */
  bird: {
    frames: [
      // 'assets/bird/contoh-camar-1.svg',
      // 'assets/bird/contoh-camar-2.svg',
    ],
    scale: 1,
  },

  /* ------------------------------------------------------------
   * 4) TERUMBU KARANG
   *    replaceDefault : true → karang bawaan diganti total oleh gambarmu
   *                     false → gambarmu dicampur dengan karang bawaan
   *    items:
   *      src    : gambar
   *      width, height : ukuran kotak gambar (karang bawaan ±60–100)
   *      zones  : 'shallow' (dangkal), 'twilight' (senja), 'midnight' (gelap), 'abyss' (dasar laut)
   *      chance : seberapa sering muncul (default 2)
   *      flip   : false → jangan dicerminkan acak (default boleh)
   * ------------------------------------------------------------ */
  coral: {
    replaceDefault: false,
    items: [
      { src: 'assets/coral/bintang-laut.png', width: 34, height: 30, zones: ['shallow', 'twilight', 'abyss'], chance: 2 },
      // { src: 'assets/coral/contoh-karang.svg', width: 80, height: 80, zones: ['shallow', 'twilight'], chance: 3 },
    ],
  },

  /* ------------------------------------------------------------
   * 5) KAPAL (termasuk pemancingnya, satu gambar utuh)
   *    src       : gambar kapal (null = pakai kapal bawaan)
   *    scale     : ukuran relatif terhadap kapal bawaan (default 1)
   *    waterline : posisi garis air pada gambar (0 = atas, 1 = bawah)
   *    rodTip    : [x, y] posisi ujung joran pancing (proporsi 0–1 dari lebar & tinggi gambar)
   *    rodTipBent: [x, y] posisi ujung joran saat ada ikan nyangkut (opsional)
   *    bucket    : [x, y] titik tujuan ikan hasil pancingan
   *    Tips: ujung joran boleh di luar gambar (nilai < 0 atau > 1).
   * ------------------------------------------------------------ */
  boat: {
    src: null,
    // src: 'assets/boat/contoh-kapal.svg',
    scale: 1,
    waterline: 0.82,
    rodTip: [0.08, 0.1],
    rodTipBent: [0.05, 0.3],
    bucket: [0.55, 0.6],
  },
};
