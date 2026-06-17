// Typing Animation
const words = [
  "Software Developer",
  "Backend Engineer",
  "Flutter Developer",
  "Game Developer",
];

let wordIndex = 0;
let charIndex = 0;

const typing = document.getElementById("typing");

function type() {
  if (charIndex < words[wordIndex].length) {
    typing.textContent += words[wordIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, 80);
  } else {
    setTimeout(erase, 1500);
  }
}

function erase() {
  if (charIndex > 0) {
    typing.textContent = words[wordIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(erase, 40);
  } else {
    wordIndex++;
    if (wordIndex >= words.length) {
      wordIndex = 0;
    }
    setTimeout(type, 300);
  }
}

type();

// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
});

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Dark Mode
const themeBtn = document.getElementById("themeBtn");

function setThemeIcon(isDark) {
  themeBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  setThemeIcon(true);
} else {
  setThemeIcon(false);
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  setThemeIcon(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Projects Data
const projects = {
  notenook: {
    title: "NoteNook",
    images: [
      "assets/NoteNook/Welcome Page.jpg",
      "assets/NoteNook/Register Page.jpg",
      "assets/NoteNook/Login Page.jpg",
      "assets/NoteNook/Home Page.jpg",
      "assets/NoteNook/My Notes Page.jpg",
      "assets/NoteNook/Fav Notes Page.jpg",
      "assets/NoteNook/Note Detail Page.jpg",
      "assets/NoteNook/Note Comment Page.jpg",
      "assets/NoteNook/Other Note Page.jpg",
      "assets/NoteNook/Search Chat Page.jpg",
      "assets/NoteNook/Chat Page.jpg",
      "assets/NoteNook/Profile Page.jpg",
      "assets/NoteNook/Profile Detail Page.jpg",
      "assets/NoteNook/Edit Profile Page.jpg",
      "assets/NoteNook/Update Password Page.jpg",
      "assets/NoteNook/Log Out Page.jpg",
    ],
    description:
      "NoteNook is a cross-platform note management application designed to help users organize, manage, and share information efficiently. The platform supports public and private notes, folder organization, bookmarks, comments, search functionality, and messaging features, creating a productive environment for both personal use and collaboration.",
    github: "https://github.com/Yupriando/NoteNook.git",
  },

  wspeedrun: {
    title: "WSpeedRun",
    images: [
      "assets/WSpeedRun/Auth Service.png",
      "assets/WSpeedRun/Game Service.png",
      "assets/WSpeedRun/Run Service.png",
    ],
    description:
      "WSpeedrun API Service is a backend platform built with a microservices architecture for managing speedrun games, categories, run submissions, and verification workflows. Developed using NestJS, Prisma ORM, and MySQL, the system provides scalable RESTful APIs, JWT-based authentication, and Swagger documentation for efficient integration and maintenance.",
    github: "https://github.com/Yupriando/WSpeedrun-Microservices.git",
  },

  tkjquizz: {
    title: "TKJ Quizz",
    images: [
      "assets/TKJ Quizz/Menu Page.jpg",
      "assets/TKJ Quizz/Level Selection Page.jpg",
      "assets/TKJ Quizz/Gameplay Page.jpg",
      "assets/TKJ Quizz/Correct Gameplay Page.jpg",
      "assets/TKJ Quizz/Finish Gameplay Page.jpg",
    ],
    description:
      "TKJ Quiz is an educational mobile game developed to support learning in Computer and Network Engineering (TKJ). The application presents computer hardware, networking, and technical concepts through interactive quizzes, allowing students to learn in a more engaging and enjoyable way compared to traditional study methods. Built using Unity and C#, the game includes multiple levels, score tracking, answer validation, and instant feedback to enhance the learning experience.",
    github: "https://github.com/Yupriando/TKJ-Quiz.git",
  },

  noisecoreweb: {
    title: "NoiseCore Website",
    images: [
      "assets/NoiseCore - Web/Home Page.png",
      "assets/NoiseCore - Web/Products Page.png",
      "assets/NoiseCore - Web/About Page.png",
      "assets/NoiseCore - Web/Deals Page.png",
      "assets/NoiseCore - Web/Join Member Page.png",
    ],
    description:
      "NoiseCore Website is a responsive e-commerce platform developed for showcasing and promoting audio products such as headphones, earbuds, speakers, and gaming accessories. The website provides an intuitive shopping experience through product catalogs, promotional sections, and membership registration features. Built using HTML, CSS, and JavaScript, the project emphasizes responsive design, user-friendly navigation, and modern UI/UX principles to ensure a seamless experience across different devices.",
    github: "https://github.com/Yupriando/NoiseCore-Website.git",
  },
};

// Modal & Carousel
let currentImages = [];
let currentImageIndex = 0;

function updateCarousel() {
  const modalImage = document.getElementById("modalImage");
  const carouselCounter = document.getElementById("carouselCounter");

  modalImage.src = currentImages[currentImageIndex];

  if (currentImages.length > 1) {
    carouselCounter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
    carouselCounter.style.display = "block";
    document.getElementById("prevBtn").style.display = "flex";
    document.getElementById("nextBtn").style.display = "flex";
  } else {
    carouselCounter.style.display = "none";
    document.getElementById("prevBtn").style.display = "none";
    document.getElementById("nextBtn").style.display = "none";
  }
}

function openModal(projectKey) {
  const project = projects[projectKey];

  currentImages = project.images;
  currentImageIndex = 0;

  document.getElementById("modalTitle").textContent = project.title;
  document.getElementById("modalDescription").textContent = project.description;
  document.getElementById("githubBtn").href = project.github;

  updateCarousel();

  document.getElementById("projectModal").style.display = "flex";
}

// Tombol navigasi carousel
document.getElementById("prevBtn").addEventListener("click", () => {
  currentImageIndex =
    (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  updateCarousel();
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  updateCarousel();
});

// Tutup modal
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("projectModal").style.display = "none";
});

window.addEventListener("click", (e) => {
  const modal = document.getElementById("projectModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Navigasi carousel dengan keyboard (panah kiri/kanan, Escape)
window.addEventListener("keydown", (e) => {
  const modal = document.getElementById("projectModal");
  if (modal.style.display !== "flex") return;

  if (e.key === "ArrowLeft") {
    currentImageIndex =
      (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateCarousel();
  } else if (e.key === "ArrowRight") {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateCarousel();
  } else if (e.key === "Escape") {
    modal.style.display = "none";
  }
});
