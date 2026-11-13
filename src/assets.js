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
   *          name (ganti nama yang tampil saat terpancing),
   *          inflatedSrc + inflatedScale (khusus puffer: gambar saat menggembung),
   *          lights (titik lampu bercahaya, terlihat jelas di laut dalam):
   *            [{ x, y, r, halo, aura, color, pulse }]
   *            x, y  = posisi di gambar 0–1 dari kiri-atas (ikan menghadap kanan)
   *            r     = besar titik (px), halo = lingkar cahaya (px)
   *            aura  = cahaya lembut besar (relatif panjang ikan, mis. 0.7)
   *            color = 'R,G,B', pulse = kecepatan kedip (0/kosong = menyala tetap)
   * ------------------------------------------------------------ */
  fishImages: {
    yellow: { src: 'assets/fish/kuning.webp', scale: 1.42 },
    parrot: { src: 'assets/fish/kakatua.webp', scale: 1.25 },
    butterfly: { src: 'assets/fish/kepe-kepe.webp', scale: 1.3 },
    hatchet: {
      src: 'assets/fish/kapak.webp',
      scale: 1.35,
      // ikan kapak: deretan organ cahaya biru di perut bawah
      lights: [[0.42, 0.71], [0.5, 0.76], [0.58, 0.8], [0.66, 0.82], [0.74, 0.83], [0.82, 0.81], [0.9, 0.75]].map(([x, y]) => ({
        x, y, r: 1.1, halo: 3.5, color: '140,200,255', pulse: 0.05,
      })),
    },
    lantern: {
      src: 'assets/fish/lentera.webp',
      scale: 1.3,
      // ikan lentera: deretan organ cahaya di sepanjang perut
      lights: [
        [0.3, 0.6], [0.38, 0.63], [0.46, 0.66], [0.54, 0.69], [0.62, 0.72], [0.7, 0.74], [0.78, 0.75], [0.86, 0.71],
      ].map(([x, y]) => ({ x, y, r: 1.2, halo: 4, color: '170,250,255', pulse: 0.04 })),
    },
    puffer: { src: 'assets/fish/buntal.webp', scale: 1.15, inflatedSrc: 'assets/fish/buntal-gembung.webp', inflatedScale: 1.3 },
    turtle: { src: 'assets/fish/penyu.webp', scale: 1.1 },
    tuna: { src: 'assets/fish/tuna.webp', scale: 1.37 },
    viper: {
      src: 'assets/fish/viper.webp',
      scale: 1.4,
      lights: [
        { x: 0.68, y: 0.1, r: 1.8, halo: 7, color: '120,200,255', pulse: 0.06 }, // umpan di ujung sirip punggung
        // barisan organ cahaya di perut
        ...[0.24, 0.33, 0.42, 0.51, 0.6, 0.69, 0.78].map((x) => ({ x, y: 0.66, r: 1, halo: 3, color: '120,170,255' })),
      ],
    },
    squid: {
      src: 'assets/fish/cumi.webp',
      scale: 1.14,
      // cumi kunang: titik cahaya di lengan & badan, berkedip bergantian
      lights: [
        [0.04, 0.6], [0.08, 0.86], [0.12, 0.3], [0.28, 0.9], [0.3, 0.16],
        [0.56, 0.5], [0.66, 0.42], [0.74, 0.54], [0.84, 0.46],
      ].map(([x, y]) => ({ x, y, r: 1.3, halo: 5, color: '120,240,255', pulse: 0.08 })),
    },
    angler: {
      src: 'assets/fish/sungut-ganda.webp',
      scale: 1.6,
      lights: [{ x: 0.925, y: 0.17, r: 3, halo: 8, aura: 0.75, color: '255,232,150', pulse: 0.05 }], // umpan bercahaya
    },
    clown: { src: 'assets/fish/badut.png', scale: 1.35 },
    tang: { src: 'assets/fish/dori.png', scale: 1.42 },
    angel: { src: 'assets/fish/angel.png', scale: 1.5 },
    shark: { src: 'assets/fish/hiu.png', scale: 1.23 },
    silver: { src: 'assets/fish/sardine.png', scale: 1.3, name: 'Sardine' },
    sardine: { src: 'assets/fish/sardine.png', scale: 1.3 },
    barracuda: { src: 'assets/fish/barakuda.png', scale: 1.3 },
    eel: {
      src: 'assets/fish/belut.png',
      scale: 1.16,
      name: 'Sea Eel',
      lights: [{ x: 0.02, y: 0.53, r: 2.2, halo: 11, color: '255,90,170', pulse: 0.1 }], // ujung ekor bercahaya pink
    },
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
   * 2b) HEWAN RAKSASA yang lewat di kejauhan
   *     whale : paus (zona senja & gelap)   manta : pari manta (zona permukaan)
   *     src   : gambar menghadap ke kanan
   *     scale : ukuran relatif (default 1)   opacity : 0–1, makin kecil makin samar (default 1)
   *     Yang tidak diisi tetap memakai gambar bawaan.
   * ------------------------------------------------------------ */
  giants: {
    whale: { src: 'assets/fish/paus.webp', scale: 1 },
    manta: { src: 'assets/fish/pari-manta.webp', scale: 1.25 },
  },

  /* ------------------------------------------------------------
   * 2c) UBUR-UBUR
   *     replaceDefault : true → ubur-ubur bawaan diganti total (di zona yang punya gambar)
   *     items:
   *       src   : gambar (payung di atas, tentakel ke bawah)
   *       zones : kedalaman tempat muncul: 0 permukaan, 1 senja, 2 gelap, 3 palung
   *       hue   : warna cahaya di laut dalam (0–360: 40 kuning, 215 biru, 315 pink)
   *       scale : ukuran (default 1)
   * ------------------------------------------------------------ */
  jellies: {
    replaceDefault: true,
    items: [
      { src: 'assets/ubur-ubur/biru.webp', zones: [0, 2, 3], hue: 215 },
      { src: 'assets/ubur-ubur/pink.webp', zones: [1, 2], hue: 315 },
      { src: 'assets/ubur-ubur/kuning.webp', zones: [0, 1], hue: 40 },
    ],
  },

  /* ------------------------------------------------------------
   * 2d) PELET MAKANAN IKAN (muncul saat air kosong diklik)
   *     src : gambar pelet, size : diameter dalam px (default 7)
   * ------------------------------------------------------------ */
  food: { src: 'assets/pelet.webp', size: 7 },

  /* ------------------------------------------------------------
   * 3) BURUNG CAMAR
   *    frames : 1 gambar, atau beberapa gambar posisi sayap untuk animasi kepakan
   *             (urutan: frame pertama = sayap paling atas, frame terakhir = sayap paling bawah)
   *    scale  : ukuran (default 1)
   * ------------------------------------------------------------ */
  bird: {
    frames: [
      'assets/bird/camar.webp',
      // 'assets/bird/contoh-camar-1.svg',
      // 'assets/bird/contoh-camar-2.svg',
    ],
    scale: 1.7,
    dive: 'assets/bird/camar-terjun.webp', // pose saat terjun menangkap ikan (opsional)
    diveAngle: 0.6, // kemiringan badan di gambar terjun, dalam radian (0.6 ≈ 35°)
    beak: [0.87, 0.84], // posisi paruh di gambar terbang (0–1), tempat ikan digigit
    catch: ['sardine'], // ikan yang bisa dibawa burung (kosongkan [] = semua ikan permukaan yang muat)
  },

  /* ------------------------------------------------------------
   * 3b) LANGIT (latar di belakang kapal & burung)
   *    src      : gambar langit untuk layar lebar (null = langit senja bawaan)
   *    srcSmall : versi kecil untuk HP (opsional)
   *    sunX     : posisi matahari di gambar (0–1 dari kiri), untuk pantulan cahaya di laut
   *    Kalau diisi, bintang, matahari & awan bawaan disembunyikan.
   * ------------------------------------------------------------ */
  sky: {
    src: 'assets/sky/langit.webp',
    srcSmall: 'assets/sky/langit-kecil.webp',
    sunX: 0.79,
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
   *      glow   : warna cahaya 'R,G,B' → karang bercahaya berdenyut (hanya menyala di 'midnight' & 'abyss')
   * ------------------------------------------------------------ */
  coral: {
    replaceDefault: true, // semua karang bawaan diganti gambar karang sendiri
    items: [
      // Acropora
      { src: 'assets/karang/acropora-branching/purple.webp', width: 99, height: 52, zones: ['twilight'] },
      { src: 'assets/karang/acropora-branching/white.webp', width: 96, height: 52, zones: ['midnight', 'abyss'], glow: '190,240,255' },
      { src: 'assets/karang/acropora-branching/yellow.webp', width: 95, height: 52, zones: ['shallow'] },
      // Anemon
      { src: 'assets/karang/anemone/green.webp', width: 103, height: 68, zones: ['shallow'] },
      { src: 'assets/karang/anemone/orange.webp', width: 96, height: 68, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/anemone/pink.webp', width: 96, height: 68, zones: ['twilight', 'midnight'], glow: '255,120,210' },
      // Karang otak
      { src: 'assets/karang/brain-coral/green.webp', width: 75, height: 40, zones: ['shallow'] },
      { src: 'assets/karang/brain-coral/red.webp', width: 66, height: 40, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/brain-coral/yellow.webp', width: 69, height: 40, zones: ['shallow'] },
      // Bintang ular
      { src: 'assets/karang/brittle-coral/orange.webp', width: 40, height: 28, zones: ['midnight', 'abyss'], glow: '255,170,110' },
      { src: 'assets/karang/brittle-coral/pink.webp', width: 39, height: 28, zones: ['twilight'] },
      { src: 'assets/karang/brittle-coral/white.webp', width: 65, height: 28, zones: ['abyss'], glow: '190,240,255' },
      // Anemon gelembung
      { src: 'assets/karang/bubble-coral/orange.webp', width: 81, height: 54, zones: ['shallow'] },
      { src: 'assets/karang/bubble-coral/red.webp', width: 81, height: 54, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/bubble-coral/white.webp', width: 81, height: 54, zones: ['midnight'], glow: '190,240,255' },
      // Karang gelembung
      { src: 'assets/karang/bubble-corals/blue.webp', width: 71, height: 48, zones: ['midnight', 'abyss'], glow: '90,200,255' },
      { src: 'assets/karang/bubble-corals/green.webp', width: 70, height: 48, zones: ['shallow'] },
      { src: 'assets/karang/bubble-corals/white.webp', width: 63, height: 48, zones: ['abyss'], glow: '190,240,255' },
      // Karang anyelir
      { src: 'assets/karang/carnatoion-coral/green.webp', width: 64, height: 92, zones: ['shallow'] },
      { src: 'assets/karang/carnatoion-coral/orange.webp', width: 58, height: 92, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/carnatoion-coral/pink.webp', width: 63, height: 92, zones: ['shallow'] },
      // Anemon karpet
      { src: 'assets/karang/carpet-anemone-coral/brown.webp', width: 60, height: 38, zones: ['twilight'] },
      { src: 'assets/karang/carpet-anemone-coral/red.webp', width: 63, height: 38, zones: ['twilight'] },
      { src: 'assets/karang/carpet-anemone-coral/white.webp', width: 60, height: 38, zones: ['abyss'], glow: '190,240,255' },
      { src: 'assets/karang/carpet-anemone-coral/yellow.webp', width: 61, height: 38, zones: ['shallow'] },
      // Karang tanduk
      { src: 'assets/karang/coral-sculptures/brown.webp', width: 90, height: 64, zones: ['twilight'] },
      { src: 'assets/karang/coral-sculptures/pink.webp', width: 91, height: 64, zones: ['shallow'] },
      { src: 'assets/karang/coral-sculptures/red.webp', width: 91, height: 64, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/coral-sculptures/yellow.webp', width: 91, height: 64, zones: ['shallow'] },
      // Kipas laut
      { src: 'assets/karang/fan-coral/orange.webp', width: 88, height: 78, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/fan-coral/purple.webp', width: 90, height: 78, zones: ['twilight', 'midnight'], glow: '190,130,255' },
      { src: 'assets/karang/fan-coral/red.webp', width: 88, height: 78, zones: ['twilight'] },
      { src: 'assets/karang/fan-coral/yellow.webp', width: 88, height: 78, zones: ['shallow'] },
      // Karang selada
      { src: 'assets/karang/fox-coral/brown.webp', width: 81, height: 48, zones: ['twilight'] },
      { src: 'assets/karang/fox-coral/green.webp', width: 81, height: 48, zones: ['shallow'] },
      { src: 'assets/karang/fox-coral/pink.webp', width: 81, height: 48, zones: ['shallow'] },
      // Gorgonian
      { src: 'assets/karang/gorgonian-coral/orange.webp', width: 97, height: 78, zones: ['twilight'] },
      { src: 'assets/karang/gorgonian-coral/pink.webp', width: 96, height: 78, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/gorgonian-coral/white.webp', width: 98, height: 78, zones: ['midnight', 'abyss'], glow: '190,240,255' },
      { src: 'assets/karang/gorgonian-coral/yellow.webp', width: 96, height: 78, zones: ['shallow'] },
      // Karang jamur
      { src: 'assets/karang/mushroom-corals/green.webp', width: 52, height: 36, zones: ['shallow'] },
      { src: 'assets/karang/mushroom-corals/orange.webp', width: 54, height: 36, zones: ['shallow'] },
      { src: 'assets/karang/mushroom-corals/pink.webp', width: 55, height: 36, zones: ['twilight'] },
      { src: 'assets/karang/mushroom-corals/white.webp', width: 54, height: 36, zones: ['midnight', 'abyss'], glow: '190,240,255' },
      // Cambuk laut
      { src: 'assets/karang/sea-fan-coral/orange.webp', width: 82, height: 84, zones: ['twilight'] },
      { src: 'assets/karang/sea-fan-coral/pink.webp', width: 79, height: 84, zones: ['twilight'] },
      { src: 'assets/karang/sea-fan-coral/purple.webp', width: 79, height: 84, zones: ['midnight'], glow: '190,130,255' },
      { src: 'assets/karang/sea-fan-coral/yellow.webp', width: 80, height: 84, zones: ['shallow'] },
      // Karang meja
      { src: 'assets/karang/table-coral/brown.webp', width: 101, height: 48, zones: ['shallow', 'twilight'] },
      { src: 'assets/karang/table-coral/green.webp', width: 104, height: 48, zones: ['shallow'] },
      { src: 'assets/karang/table-coral/yellow.webp', width: 102, height: 48, zones: ['shallow'] },
      // Rumput laut
      { src: 'assets/dasar-laut/rumput-laut.webp', width: 59, height: 100, zones: ['shallow', 'twilight'], chance: 2 },
      // Bintang laut
      { src: 'assets/coral/bintang-laut.png', width: 34, height: 30, zones: ['shallow', 'twilight', 'abyss'], chance: 2 },
      // { src: 'assets/coral/contoh-karang.svg', width: 80, height: 80, zones: ['shallow', 'twilight'], chance: 3 },
    ],
  },

  /* ------------------------------------------------------------
   * 4a) TANAH TERUMBU (pita karang di antara bagian halaman)
   *    Tekstur batu belakang & depan per zona, diwarnai dari gambar tanah dasar laut.
   *    Gambar diregangkan selebar terumbu (1440 x 135 untuk back, 1440 x 75 untuk front).
   *    Kosongkan = gradasi warna polos bawaan.
   * ------------------------------------------------------------ */
  reefGround: {
    shallow: { back: 'assets/terumbu/shallow-back.webp', front: 'assets/terumbu/shallow-front.webp' },
    twilight: { back: 'assets/terumbu/twilight-back.webp', front: 'assets/terumbu/twilight-front.webp' },
    midnight: { back: 'assets/terumbu/midnight-back.webp', front: 'assets/terumbu/midnight-front.webp' },
  },

  /* ------------------------------------------------------------
   * 4b) TANAH DASAR LAUT (bagian paling bawah halaman)
   *    back  : tanah belakang (bukit), digambar di belakang karang barisan belakang
   *    front : tanah depan (pasir), digambar di belakang karang barisan depan
   *    Ukuran kanvas 1440 x 340 (atau 2x: 2880 x 680), PNG transparan / WEBP.
   *    Template & panduan ada di referensi-aset/dasar-laut/. Kosongkan (null) = bentuk polos bawaan.
   * ------------------------------------------------------------ */
  seafloor: {
    back: 'assets/dasar-laut/tanah-belakang.webp',
    front: 'assets/dasar-laut/tanah-depan.webp',
    // tinggi tepi atas tanah belakang tiap 60 unit (x = 0, 60, …, 1440), diukur dari gambarnya,
    // supaya kaki karang belakang menempel di tanah. Kalau gambar tanah diganti, hapus baris ini.
    backTop: [212.7, 206.7, 201.3, 198.7, 191.3, 192.7, 194, 194, 192.7, 195.3, 188.7, 179.3, 186.7, 187.3, 191.3, 187.3, 182.7, 192.7, 194.7, 195.3, 198, 198.7, 195.3, 205.3, 214.7],
    // rumput laut: posisi x, tinggi, dan arah (flip) di dasar laut
    weed: { src: 'assets/dasar-laut/rumput-laut.webp', ratio: 0.594, items: [[118, 200], [150, 160, true], [1238, 210, true], [1272, 165], [640, 90]] },
    // peti harta karun: dipotong jadi tutup + badan supaya tutupnya bisa terbuka
    chest: { lid: 'assets/dasar-laut/peti-tutup.webp', body: 'assets/dasar-laut/peti-badan.webp' },
    // isi peti saat dibuka (gambar transparan, kosongkan = gambar SVG bawaan)
    chestItems: {
      coin: 'assets/dasar-laut/isi-peti/koin.webp',
      floppy: 'assets/dasar-laut/isi-peti/disket.webp',
      duck: 'assets/dasar-laut/isi-peti/bebek.webp',
      coffee: 'assets/dasar-laut/isi-peti/kopi.webp',
      cv: 'assets/dasar-laut/isi-peti/cv.webp',
    },
    // TV tua yang menampilkan "hello world" (layar di gambar harus transparan)
    tv: 'assets/dasar-laut/tv.webp',
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
    src: 'assets/kapal/kapal.webp',
    // src: 'assets/boat/contoh-kapal.svg',
    ratio: 0.4589, // tinggi/lebar gambar kapal (dipakai menghitung posisi ujung joran)
    scale: 1.05,
    waterline: 0.87,
    rodTip: [0.08, 0.1], // dipakai kalau tidak ada fisher
    rodTipBent: [0.05, 0.3],
    bucket: [0.27, 0.6],
    // pemancing (gambar terpisah, duduk di belakang dinding kapal). Satuan: proporsi lebar/tinggi kapal
    //   x, w   : posisi kiri & lebar (proporsi lebar kapal); bottom : tepi bawah (proporsi tinggi kapal)
    //   tip / pivot : ujung joran & tangan pada gambar (0–1); titik tali otomatis ikut gambar
    //   bend   : derajat condong ke depan saat ikan menarik
    fisher: { src: 'assets/kapal/pemancing.webp', x: 0, bottom: 0.65, w: 0.28, tip: [0.004, 0.002], pivot: [0.45, 0.62], bend: -9 },
    // anjing di dek (menggantikan kucing)
    dog: { src: 'assets/kapal/anjing.webp', x: 0.47, bottom: 0.66, w: 0.125 },
  },
  // kail + umpan cacing di dalam air. height: tinggi gambar (px), eye: posisi mata kail (tempat tali) 0–1
  // bare: kail yang sama TANPA cacing (dipakai setelah umpannya dimakan ikan; ukuran & posisi gambar harus sama)
  hook: { src: 'assets/kapal/kail.webp', bare: 'assets/kapal/kail-kosong.webp', height: 30, eye: [0.777, 0.02] },
  // pelampung. height: tinggi (px); waterline: garis air pada gambar (0–1, bagian bawahnya terendam);
  // eye: posisi cincin bawah (tempat tali ke kail). Kosongkan = bola merah-putih bawaan
  bobber: { src: 'assets/kapal/pelampung.webp', height: 36, waterline: 0.575, eye: 0.965 },
};
