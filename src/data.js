/*
 * ==========================================================
 *  DATA PORTOFOLIO — edit file ini untuk mengganti isi web.
 *  Semua teks, skill, proyek, dan pengalaman ada di sini.
 * ==========================================================
 */

export const profile = {
  name: 'Yupri',
  logo: 'yupri',
  title: 'Fullstack Developer · IT Enthusiast',
  initial: 'Y',
  photo: null, // contoh: 'foto.jpg' (taruh file di folder public/)
  email: 'email@kamu.com',
  cv: 'cv.pdf', // taruh file cv.pdf di folder public/
  roles: [
    'Fullstack Developer',
    'Mahasiswa IT 🎓',
    'Pecinta Ikan 🐟',
    'Problem Solver',
    'Pemancing Bug 🎣',
  ],
  heroDesc: 'Lagi santai mancing bug di tengah laut. Mau kenal lebih dalam? Ayo menyelam bareng 🤿',
  facts: [
    ['📍', 'Indonesia'],
    ['🎓', 'Teknik Informatika'],
    ['🐠', 'Penghobi aquascape'],
  ],
  aboutLead:
    'Aku developer yang percaya bahwa kode yang baik itu seperti ekosistem laut: rapi, saling terhubung, dan hidup.',
  aboutText:
    'Sehari-hari aku membangun aplikasi web dari sisi tampilan sampai server. Aku senang memecahkan masalah, belajar teknologi baru, dan membuat sesuatu yang benar-benar dipakai orang. Di luar layar, kamu bisa menemukanku sedang mancing atau merawat akuarium di rumah.',
  // Ditampilkan sebagai objek JavaScript di kartu kode
  code: [
    ['nama', 'Yupri'],
    ['peran', 'Fullstack Developer'],
    ['lokasi', 'Indonesia 🇮🇩'],
    ['hobi', ['ngoding', 'mancing', 'aquascape']],
    ['ikanFavorit', 'Cupang 🐠'],
    ['bahanBakar', 'kopi ☕'],
    ['siapKolaborasi', true],
  ],
  stats: [
    { value: 3, suffix: '+', label: 'Tahun ngoding' },
    { value: 20, suffix: '+', label: 'Proyek selesai' },
    { value: 1200, suffix: '+', label: 'Commit di GitHub' },
    { text: '∞', label: 'Cangkir kopi' },
  ],
};

export const skillGroups = [
  {
    icon: '🖥️',
    name: 'Frontend',
    items: [
      ['HTML & CSS', 90],
      ['JavaScript', 85],
      ['React', 75],
      ['Tailwind CSS', 80],
    ],
  },
  {
    icon: '⚙️',
    name: 'Backend',
    items: [
      ['Node.js / Express', 75],
      ['PHP / Laravel', 80],
      ['Python', 65],
      ['MySQL / PostgreSQL', 75],
    ],
  },
  {
    icon: '🧰',
    name: 'Tools & Lainnya',
    items: [
      ['Git & GitHub', 85],
      ['Linux', 70],
      ['Docker', 55],
      ['Figma (UI/UX)', 70],
    ],
  },
];

// Titik di radar sonar: sudut (derajat, 0 = kanan) dan jarak dari pusat (0–1)
export const sonarBlips = [
  ['React', -60, 0.55],
  ['Node.js', -20, 0.8],
  ['JavaScript', 25, 0.45],
  ['Laravel', 70, 0.75],
  ['MySQL', 120, 0.6],
  ['Git', 165, 0.8],
  ['Python', 200, 0.4],
  ['Figma', 245, 0.72],
];

export const learning = ['TypeScript', 'Next.js', 'Flutter', 'Cloud (AWS)', 'IoT / ESP32'];

export const projectFilters = [
  ['all', 'Semua'],
  ['web', 'Web'],
  ['mobile', 'Mobile'],
  ['iot', 'IoT'],
  ['tools', 'Tools'],
];

export const projects = [
  {
    title: 'AquaMonitor',
    cat: 'iot',
    emoji: '🐠',
    label: 'aquamonitor.local',
    theme: 'm1',
    desc: 'Dashboard real-time untuk memantau suhu, pH, dan kejernihan air akuarium memakai sensor ESP32, lengkap dengan notifikasi ke HP.',
    tags: ['ESP32', 'React', 'MQTT', 'Firebase'],
    links: [['Demo', '#'], ['GitHub', '#']],
  },
  {
    title: 'IkanHias Store',
    cat: 'web',
    emoji: '🛒',
    label: 'ikanhias.store',
    theme: 'm2',
    desc: 'Toko online ikan hias dengan keranjang belanja, pembayaran online, dan panel admin untuk mengelola stok serta pesanan.',
    tags: ['Laravel', 'MySQL', 'Tailwind'],
    links: [['Demo', '#'], ['GitHub', '#']],
  },
  {
    title: 'PasangSurut',
    cat: 'mobile',
    emoji: '🌊',
    label: 'pasang-surut.apk',
    theme: 'm3',
    desc: 'Aplikasi mobile untuk nelayan: info pasang surut, cuaca laut, dan titik mancing favorit yang bisa dibagikan ke teman.',
    tags: ['Flutter', 'REST API', 'Maps'],
    links: [['Unduh', '#'], ['GitHub', '#']],
  },
  {
    title: 'Coral CLI',
    cat: 'tools',
    emoji: '🪸',
    label: '$ coral init',
    theme: 'm4',
    desc: 'Tool command-line untuk membuat kerangka proyek web dalam hitungan detik: struktur folder, konfigurasi linter, dan template siap pakai.',
    tags: ['Python', 'CLI', 'Open Source'],
    links: [['Docs', '#'], ['GitHub', '#']],
  },
  {
    title: 'Sistem Informasi Akademik',
    cat: 'web',
    emoji: '📚',
    label: 'sistem-akademik.id',
    theme: 'm5',
    desc: 'Aplikasi web untuk mengelola jadwal, nilai, dan presensi mahasiswa dengan dashboard berbeda untuk admin, dosen, dan mahasiswa.',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
    links: [['Demo', '#'], ['GitHub', '#']],
  },
  {
    title: 'Portofolio Bawah Laut',
    cat: 'web',
    emoji: '🐟',
    label: 'yupri.dev',
    theme: 'm6',
    desc: 'Website yang sedang kamu selami ini! Dibangun dengan React, Framer Motion, dan Canvas API: ikan yang bisa dipegang dan pengukur kedalaman.',
    tags: ['React', 'Framer Motion', 'Canvas'],
    links: [['Ke atas', '#top'], ['GitHub', '#']],
  },
];

export const experiences = [
  {
    date: '2025 — Sekarang',
    role: 'Fullstack Developer',
    at: 'Freelance',
    points: [
      'Membangun website dan aplikasi web untuk UMKM dan klien perorangan.',
      'Menangani proyek dari desain UI, pengembangan, sampai deploy ke server.',
    ],
    tags: ['React', 'Laravel', 'VPS'],
  },
  {
    date: '2024',
    role: 'Web Developer Intern',
    at: 'PT Contoh Teknologi',
    points: [
      'Mengembangkan fitur dashboard internal yang dipakai lebih dari 50 karyawan.',
      'Menulis REST API dan mengoptimalkan query database sehingga halaman 40% lebih cepat.',
    ],
    tags: ['Node.js', 'MySQL', 'Git'],
  },
  {
    date: '2023 — 2024',
    role: 'Asisten Laboratorium',
    at: 'Lab Pemrograman Kampus',
    points: [
      'Membimbing praktikum Algoritma & Pemrograman Web untuk lebih dari 60 mahasiswa.',
      'Menyusun modul praktikum dan soal latihan.',
    ],
  },
  {
    date: '2022 — Sekarang',
    role: 'S1 Teknik Informatika',
    at: 'Universitas Contoh',
    points: [
      'Fokus pada rekayasa perangkat lunak dan pengembangan web.',
      'Aktif di komunitas programming kampus.',
    ],
  },
];

export const socials = [
  { name: 'GitHub', icon: 'github', href: 'https://github.com/' },
  { name: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/' },
  { name: 'Instagram', icon: 'instagram', href: 'https://instagram.com/' },
  { name: 'Email', icon: 'mail', href: `mailto:${profile.email}` },
];

// Celetukan si pemancing saat kapal diklik
export const boatLines = [
  'Lagi nunggu ikan… sekalian nunggu build 😴',
  'Strike! Eh, ternyata cuma bug 🐛',
  'Kode di laptop, kail di laut 🎣',
  'npm install ikan --save 🐟',
  'Sinyal di tengah laut: 1 bar 📶',
  'Ikan juga butuh code review 🧐',
];
