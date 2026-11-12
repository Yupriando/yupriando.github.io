/*
 * ==========================================================
 *  DATA PORTOFOLIO — edit file ini untuk mengganti isi web.
 *  Semua teks, skill, proyek, dan pengalaman ada di sini.
 * ==========================================================
 */

export const profile = {
  name: "Yupri",
  logo: "yupri",
  title: "Software Developer · IT Enthusiast",
  initial: "Y",
  photo: "assets/foto-profil.jpg", // versi kecil dari aset-asli/foto.jpg (kalau tidak ada, tampil inisial)
  email: "yupriandoo@gmail.com",
  cv: "assets/cv.pdf", // file CV ada di public/assets/cv.pdf
  roles: ["Software Developer", "IT Student", "Problem Solver", "Bug Fisher"],
  // satu baris jelas untuk recruiter (tampil di bawah tagline hero)
  headline: "Computer Science student at BINUS University · building web, mobile & backend apps · open to internships",
  heroDesc:
    "Just chilling out at sea, fishing for bugs. Want to get to know me better? Dive in with me.",
  facts: [
    ["pin", "Indonesia"],
    ["cap", "Computer Science @ BINUS"],
    ["fish", "Aquascape hobbyist"],
  ],
  aboutLead:
    "I'm a developer who believes good code is like an ocean ecosystem: tidy, connected, and alive.",
  aboutText:
    "Day to day, I build software, from web and mobile apps to the backend services behind them. I love solving problems, learning new tech, and making things people actually use.",
  // Ditampilkan sebagai objek JavaScript di kartu kode
  code: [
    ["name", "Yupri"],
    ["role", "Software Developer"],
    ["location", "Indonesia 🇮🇩"],
    ["hobbies", ["coding", "working out"]],
    ["favoriteFish", "Black Marlin"],
    ["fuel", "coffee"],
    ["openToCollab", true],
  ],
  stats: [
    { value: 2, suffix: "+", label: "Years coding" },
    { source: "github", suffix: "", label: "Projects shipped" }, // otomatis: jumlah repo di bagian Projects
    { source: "demos", suffix: "", label: "Live demos" }, // otomatis: proyek yang punya demo (badge LIVE)
    { text: "∞", label: "Cups of coffee" },
  ],
};

// Persentase skill baru (TypeScript, Dart, Java, C++, NestJS, REST API, Socket.IO, Supabase, Prisma, Vercel)
// masih perkiraan dari proyek di GitHub — sesuaikan dengan kemampuanmu.
export const skillGroups = [
  {
    wide: true, // lebar penuh, skill dua kolom
    icon: "code",
    name: "Languages",
    items: [
      ["JavaScript", 70],
      ["TypeScript", 60],
      ["Dart", 70],
      ["Python", 65],
      ["Java", 55],
      ["C++", 55],
    ],
  },
  {
    icon: "server",
    name: "Backend",
    items: [
      ["Node.js / Express", 70],
      ["NestJS", 60],
      ["REST API & Swagger", 70],
      ["Socket.IO", 55],
    ],
  },
  {
    icon: "database",
    name: "Database & Cloud",
    items: [
      ["MySQL", 70],
      ["PostgreSQL / Supabase", 65],
      ["Prisma", 55],
      ["Vercel", 65],
    ],
  },
  {
    icon: "phone",
    name: "Mobile & Game",
    items: [
      ["Flutter", 75],
      ["Android Studio", 70],
      ["Unity (C#)", 60],
    ],
  },
  {
    icon: "monitor",
    name: "Frontend",
    items: [
      ["HTML & CSS", 70],
      ["React", 50],
    ],
  },
  {
    wide: true, // lebar penuh, skill dua kolom
    icon: "toolbox",
    name: "Tools & More",
    items: [
      ["Git & GitHub", 80],
      ["Figma (UI/UX)", 75],
    ],
  },
];

// Titik di radar sonar: sudut (derajat, 0 = kanan) dan jarak dari pusat (0–1). Samakan dengan skillGroups.
export const sonarBlips = [
  ["React", -60, 0.55],
  ["Node.js", -20, 0.8],
  ["JavaScript", 25, 0.45],
  ["Flutter", 70, 0.75],
  ["MySQL", 120, 0.6],
  ["Git", 165, 0.8],
  ["Python", 200, 0.4],
  ["Figma", 245, 0.72],
  ["Unity", 140, 0.32],
  ["TypeScript", 285, 0.88],
  ["NestJS", -30, 0.28],
  ["Supabase", 98, 0.42],
];

// TypeScript & Flutter dipindah ke kartu skill karena sudah dipakai di proyek
export const learning = [
  "Next.js",
  "Cloud (AWS)",
  "IoT / ESP32",
];

export const projectFilters = [
  ["all", "All"],
  ["live", "▶ Try it live"],
  ["web", "Web"],
  ["mobile", "Mobile"],
  ["backend", "Backend"],
  ["game", "Game"],
  ["design", "Design"],
];

/*
 * PROYEK — diambil otomatis dari GitHub saat halaman dibuka.
 * Repo baru yang belum ada di `projects` tetap muncul (pakai deskripsi & bahasa dari GitHub).
 * Daftar di bawah dipakai untuk merapikan tampilan + cadangan kalau GitHub tidak bisa diakses.
 *
 *   repo     : nama repo persis seperti di GitHub
 *   demo     : link yang bisa dicoba pengunjung (dibuka di jendela "Coba Langsung")
 *   demoType : 'app' (aplikasi web) | 'api' (dokumentasi API yang bisa dicoba) | 'design'
 *   embed    : false kalau situsnya menolak ditampilkan di dalam iframe → langsung buka tab baru
 *   thumb    : gambar tampilan proyek (16:9, taruh di public/assets/proyek/). Kosong = emoji
 *   Kalau repo punya "Website" di pengaturan GitHub, itu otomatis dipakai sebagai demo.
 */
export const github = {
  username: "Yupriando",
  hide: ["yupriando.github.io"], // repo yang tidak ditampilkan
  brokenDemos: ["https://savely-api.vercel.app"], // link "Website" di GitHub yang sudah mati
};

export const projects = [
  {
    repo: "Hapki-Snap",
    thumb: "assets/proyek/hapki-snap.webp", // tampilan proyek (16:9)
    title: "Hapki Snap",
    cat: "web",
    emoji: "📸",
    theme: "m2",
    desc: "An event photo wall: guests snap photos with color filters, the shots appear instantly on the big screen as a scrolling ticker, and admins moderate everything from a dashboard.",
    tags: ["HTML", "JavaScript", "Camera"],
    demo: "https://hapki-snap.vercel.app",
    demoType: "app",
  },
  {
    repo: "BulkIn",
    title: "BulkIn",
    cat: "mobile",
    emoji: "💪",
    theme: "m1",
    desc: "An Android app for bulking programs: log daily meals, calories, protein, and body weight. Just pick a food and enter its weight, and the rest is calculated automatically.",
    tags: ["Flutter", "Express", "Supabase", "Claude API"],
    demo: "https://bulk-in.vercel.app/docs",
    demoType: "api",
  },
  {
    repo: "Bebaca",
    thumb: "assets/proyek/bebaca.webp", // tampilan proyek (16:9)
    title: "Bebaca",
    cat: "mobile",
    emoji: "📖",
    theme: "m5",
    desc: "A reading-practice app for kids. Flutter frontend, Node.js + Express backend, with Supabase (Postgres + Auth) as the database.",
    tags: ["Flutter", "Node.js", "Supabase"],
    demo: "https://bebaca.vercel.app/docs/",
    demoType: "api",
  },
  {
    repo: "NoteNook",
    title: "NoteNook",
    cat: "mobile",
    emoji: "🗒️",
    theme: "m3",
    desc: "A cross-platform notes app: create, organize, and manage notes, complete with login, messaging, and media sharing.",
    tags: ["Flutter", "Express", "MySQL", "Socket.IO", "JWT"],
  },
  {
    repo: "Savely",
    title: "Savely",
    cat: "mobile",
    emoji: "💰",
    theme: "m4",
    desc: "A mobile app that helps you manage your savings and spending.",
    tags: ["Flutter", "Riverpod", "TypeScript", "Supabase"],
  },
  {
    repo: "WSpeedrun-Microservices",
    title: "WSpeedrun Microservices",
    cat: "backend",
    emoji: "⏱️",
    theme: "m6",
    desc: "A microservices backend for speedrun submissions, game categories, leaderboards, and authentication, split into Auth, Game, and Run services.",
    tags: ["NestJS", "TypeScript", "Prisma", "JWT", "Microservices"],
  },
  {
    repo: "TKJ-Quiz",
    thumb: "assets/proyek/tkj-quiz.webp", // tampilan proyek (16:9)
    title: "TKJ Quiz",
    cat: "game",
    emoji: "🎮",
    theme: "m1",
    desc: "An educational quiz game for learning Computer & Network Engineering: four levels, multiple choice, scoring, and right/wrong answer feedback.",
    tags: ["Unity", "C#"],
  },
  {
    repo: "NoiseCore-Website",
    thumb: "assets/proyek/noisecore-website.webp", // tampilan proyek (16:9)
    title: "NoiseCore Website",
    cat: "web",
    emoji: "🎧",
    theme: "m4",
    desc: "A responsive e-commerce website for audio lovers: a catalog of headphones, earbuds, and speakers, product promos, and member sign-up.",
    tags: ["HTML", "CSS", "JavaScript"],
    demo: "https://yupriando.github.io/NoiseCore-Website/",
    demoType: "app",
  },
  {
    repo: "NoiseCore-Figma",
    thumb: "assets/proyek/noisecore-figma.webp", // tampilan proyek (16:9)
    title: "NoiseCore UI/UX",
    cat: "design",
    emoji: "🎨",
    theme: "m2",
    desc: "UI/UX design for the NoiseCore audio e-commerce platform, made in Figma.",
    tags: ["Figma", "UI/UX"],
    demo: "https://www.figma.com/design/LZwzKnc34HwWa5pQCr44Xl/",
    demoType: "design",
    embed: false,
  },
];

// Diambil dari CV (public/assets/cv.pdf), urut dari yang terbaru. points & tags boleh dikosongkan.
export const experiences = [
  {
    date: "2026 — Present",
    role: "Champion Division Staff",
    at: "Hapkido BINUS",
    points: [
      "Chairperson of PKM Hapkido BINUS (2026): led a community service program teaching Hapkido martial arts to junior high school students.",
      "Treasurer of Hapkido BINUS Gathering (2026): managed the budget and finances for a Halloween-themed gathering for Hapkido members.",
    ],
    tags: ["Leadership", "Teaching", "Event Management", "Finance"],
  },
  {
    date: "2025 — Present",
    role: "Dhamma & Social Division Staff",
    at: "KMBD BINUS",
    points: [
      "Event & Logistics Coordinator for DV Teach (2025): led event preparation and logistics coordination to support a successful event.",
      "Logistics Coordinator for Asadha Puja (2025): managed event logistics and coordinated equipment preparation with cross-functional teams.",
    ],
    tags: ["Event Management", "Logistics", "Teamwork"],
  },
  {
    date: "2025",
    role: "Freshmen Leader & Freshmen Partner B2029",
    at: "BINUS University",
    points: [
      "As Freshmen Leader, mentored new students in adapting to university life.",
      "As Freshmen Partner, supported freshmen through mentoring and academic guidance programs.",
    ],
    tags: ["Leadership", "Mentoring"],
  },
  {
    date: "2024 — Present",
    role: "Bachelor of Computer Science",
    at: "BINUS University",
    points: ["Relevant coursework: Programming, Data Structures, Database Systems, and Software Engineering."],
  },
  {
    date: "2023 — 2024",
    role: "Metaverse Club President",
    at: "SMK Negeri 1 Tanjungpinang",
    points: [
      "Led club activities and coordinated members in technology-related projects.",
      "Organized learning sessions introducing emerging technologies and digital innovation concepts.",
    ],
    tags: ["Leadership", "Communication"],
  },
  {
    date: "Jan — Jun 2023",
    role: "IT Support Intern",
    at: "Infotech Computer",
    points: [
      "Installed operating systems, configured software, and assembled PCs.",
      "Troubleshot hardware and software issues, performed routine maintenance, and provided technical support for laptops and desktops.",
    ],
    tags: ["PC Assembly", "OS Installation", "Troubleshooting"],
  },
  {
    date: "2021 — 2024",
    role: "Computer and Network Engineering",
    at: "SMK Negeri 1 Tanjungpinang",
    points: ["Studied computer hardware, networking fundamentals, operating systems, and IT troubleshooting."],
  },
];

export const socials = [
  { name: "GitHub", icon: "github", href: "https://github.com/Yupriando" },
  {
    name: "LinkedIn",
    icon: "linkedin",
    href: "https://linkedin.com/in/Yupriando",
  },
  {
    name: "Instagram",
    icon: "instagram",
    href: "https://www.instagram.com/yupriandoo?vrfl=MTYwcTAwMXgwdmduYg==",
  },
  { name: "Email", icon: "mail", href: `mailto:${profile.email}` },
];

// Celetukan si pemancing saat kapal diklik
export const boatLines = [
  "Waiting for a fish… and for the build 😴",
  "Strike! Oh wait, it's just a bug 🐛",
  "Code on the laptop, hook in the sea 🎣",
  "npm install fish --save 🐟",
  "Signal out at sea: 1 bar 📶",
  "Even fish need code review 🧐",
];
