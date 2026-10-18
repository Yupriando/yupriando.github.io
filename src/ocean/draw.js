/*
 * Fungsi-fungsi menggambar penghuni laut di kanvas.
 * Semua ikan digambar menghadap ke kanan (+x) dengan pusat di (0,0).
 */
import { isReady, isBroken } from './images';

const TAU = Math.PI * 2;

export function applyTransform(c, f) {
  c.translate(f.x, f.y);
  if (f.sp.upright) return;
  c.rotate(f.angle);
  if (Math.cos(f.angle) < 0) c.scale(1, -1); // perut tetap di bawah
}

function bodyPath(c, L, h, nose = 0.5) {
  c.beginPath();
  c.moveTo(L * nose, 0);
  c.bezierCurveTo(L * 0.42, -h * 1.05, -L * 0.28, -h * 1.02, -L * 0.47, 0);
  c.bezierCurveTo(-L * 0.28, h * 1.02, L * 0.42, h * 1.05, L * nose, 0);
  c.closePath();
}

function eye(c, x, y, r, iris = '#111', white = '#fff') {
  c.fillStyle = white;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.fillStyle = iris;
  c.beginPath();
  c.arc(x + r * 0.15, y, r * 0.6, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.8)';
  c.beginPath();
  c.arc(x + r * 0.35, y - r * 0.3, r * 0.2, 0, TAU);
  c.fill();
}

/* ------------------------------------------------------------------ */
/*  Ikan umum (badan oval + corak)                                     */
/* ------------------------------------------------------------------ */
function genericFish(c, f) {
  const sp = f.sp;
  const L = f.size, h = L * sp.h;
  const struggle = f.grabbed || f.hooked;
  const wig = Math.sin(f.phase) * (struggle ? 0.7 : 0.28);

  // ekor
  c.save();
  c.translate(-L * 0.42, 0);
  c.rotate(wig);
  c.fillStyle = sp.tailColor || sp.fin;
  c.beginPath();
  if (sp.tail === 'fork') {
    c.moveTo(4, 0);
    c.lineTo(-L * 0.26, -h * 1.15);
    c.lineTo(-L * 0.14, 0);
    c.lineTo(-L * 0.26, h * 1.15);
  } else if (sp.tail === 'round') {
    c.moveTo(4, 0);
    c.quadraticCurveTo(-L * 0.12, -h * 1.1, -L * 0.28, -h * 0.45);
    c.quadraticCurveTo(-L * 0.34, 0, -L * 0.28, h * 0.45);
    c.quadraticCurveTo(-L * 0.12, h * 1.1, 4, 0);
  } else {
    c.moveTo(2, 0);
    c.lineTo(-L * 0.3, -h * 0.8);
    c.quadraticCurveTo(-L * 0.2, 0, -L * 0.3, h * 0.8);
  }
  c.closePath();
  c.fill();
  c.restore();

  // sirip punggung & perut
  c.fillStyle = sp.fin;
  if (sp.dorsal === 'tall') {
    c.beginPath();
    c.moveTo(L * 0.15, -h * 0.7);
    c.quadraticCurveTo(-L * 0.1, -h * 1.9, -L * 0.55, -h * 1.45 + wig * 4);
    c.quadraticCurveTo(-L * 0.2, -h * 0.9, -L * 0.25, -h * 0.5);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(L * 0.1, h * 0.7);
    c.quadraticCurveTo(-L * 0.1, h * 1.9, -L * 0.55, h * 1.45 - wig * 4);
    c.quadraticCurveTo(-L * 0.2, h * 0.9, -L * 0.25, h * 0.5);
    c.closePath();
    c.fill();
  } else {
    c.beginPath();
    c.moveTo(-L * 0.18, -h * 0.75);
    c.quadraticCurveTo(-L * 0.02, -h * 1.45, L * 0.14, -h * 0.8);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(-L * 0.1, h * 0.75);
    c.quadraticCurveTo(0, h * 1.2, L * 0.08, h * 0.75);
    c.closePath();
    c.fill();
  }

  // badan
  bodyPath(c, L, h, sp.nose);
  const g = c.createLinearGradient(0, -h, 0, h);
  g.addColorStop(0, sp.body);
  g.addColorStop(1, sp.belly);
  c.fillStyle = g;
  c.fill();

  // corak (dipotong mengikuti badan)
  c.save();
  c.clip();
  switch (sp.pattern) {
    case 'clown':
      c.fillStyle = '#fff';
      c.fillRect(L * 0.16, -h, L * 0.1, h * 2);
      c.fillRect(-L * 0.17, -h, L * 0.1, h * 2);
      c.fillStyle = 'rgba(0,0,0,.25)';
      c.fillRect(L * 0.26, -h, L * 0.015, h * 2);
      c.fillRect(-L * 0.07, -h, L * 0.015, h * 2);
      break;
    case 'tang':
      c.strokeStyle = '#0b1d4d';
      c.lineWidth = h * 0.22;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(L * 0.22, -h * 0.45);
      c.quadraticCurveTo(-L * 0.05, -h * 0.1, -L * 0.3, -h * 0.35);
      c.stroke();
      break;
    case 'angel':
      c.fillStyle = 'rgba(40,70,170,.55)';
      for (let k = 0; k < 3; k++) c.fillRect(L * (0.22 - k * 0.22), -h, L * 0.05, h * 2);
      break;
    case 'butterfly':
      c.fillStyle = '#ffb703';
      c.fillRect(-L, -h * 1.1, L * 2, h * 0.55);
      c.fillStyle = '#1d1d1d';
      c.fillRect(L * 0.24, -h, L * 0.07, h * 2);
      c.beginPath();
      c.arc(-L * 0.25, -h * 0.15, h * 0.17, 0, TAU);
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 1;
      c.stroke();
      break;
    case 'parrot':
      c.strokeStyle = 'rgba(255,255,255,.28)';
      c.lineWidth = 1;
      for (let x = -L * 0.35; x < L * 0.3; x += L * 0.09) {
        for (let y = -h * 0.6; y < h * 0.7; y += h * 0.35) {
          c.beginPath();
          c.arc(x, y, L * 0.05, -1.2, 1.2);
          c.stroke();
        }
      }
      c.fillStyle = 'rgba(255,112,166,.65)';
      c.beginPath();
      c.ellipse(L * 0.36, h * 0.15, L * 0.1, h * 0.35, 0, 0, TAU);
      c.fill();
      break;
    case 'bars':
      c.fillStyle = 'rgba(20,35,50,.45)';
      for (let k = 0; k < 6; k++) {
        const x = L * (0.25 - k * 0.12);
        c.beginPath();
        c.moveTo(x, -h);
        c.lineTo(x + L * 0.04, -h);
        c.lineTo(x - L * 0.02, 0);
        c.lineTo(x - L * 0.06, 0);
        c.fill();
      }
      break;
    default:
      break;
  }
  if (sp.shine) {
    c.strokeStyle = 'rgba(255,255,255,.55)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(L * 0.35, -h * 0.05);
    c.lineTo(-L * 0.35, -h * 0.05);
    c.stroke();
  }
  c.restore();

  if (sp.pattern === 'finlets') {
    c.fillStyle = sp.fin;
    for (let k = 0; k < 5; k++) {
      const x = -L * (0.12 + k * 0.06);
      const yy = h * (0.75 - k * 0.1);
      c.beginPath();
      c.moveTo(x, -yy);
      c.lineTo(x - 3, -yy - 3);
      c.lineTo(x - 4, -yy + 1);
      c.fill();
      c.beginPath();
      c.moveTo(x, yy);
      c.lineTo(x - 3, yy + 3);
      c.lineTo(x - 4, yy - 1);
      c.fill();
    }
  }
  if (sp.pattern === 'fangs') {
    c.fillStyle = '#e8e8e8';
    for (let k = 0; k < 3; k++) {
      const x = L * (0.42 + k * 0.035);
      c.beginPath();
      c.moveTo(x, -h * 0.1);
      c.lineTo(x + 1.5, h * 1.1);
      c.lineTo(x + 3, -h * 0.1);
      c.fill();
    }
  }
  if (sp.pattern === 'angler') {
    c.fillStyle = '#120b14';
    c.beginPath();
    c.moveTo(L * 0.5, h * 0.02);
    c.lineTo(L * 0.18, h * 0.3);
    c.lineTo(L * 0.46, h * 0.45);
    c.closePath();
    c.fill();
    c.fillStyle = '#e8e8e8';
    for (let i = 0; i < 4; i++) {
      const tx = L * (0.24 + i * 0.06);
      c.beginPath();
      c.moveTo(tx, h * 0.12);
      c.lineTo(tx + 3, h * 0.12);
      c.lineTo(tx + 1.5, h * 0.26);
      c.fill();
    }
    c.strokeStyle = '#3b2c40';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(L * 0.15, -h * 0.9);
    c.quadraticCurveTo(L * 0.5, -h * 1.9, L * 0.66, -h * 1.25);
    c.stroke();
  }

  // sirip dada
  c.globalAlpha = 0.85;
  c.fillStyle = sp.fin;
  c.beginPath();
  c.ellipse(L * 0.05, h * 0.25, L * 0.1, Math.max(2, h * 0.22), 0.5 + Math.sin(f.phase * 1.3) * 0.3, 0, TAU);
  c.fill();
  c.globalAlpha = 1;

  const er = Math.max(1.6, Math.min(h * 0.2, L * 0.07) * (sp.eye || 1));
  eye(c, L * 0.3, -h * 0.18, er, '#111', f.type === 'angler' ? '#d9d2b8' : '#fff');
}

/* ------------------------------------------------------------------ */
/*  Bentuk khusus                                                      */
/* ------------------------------------------------------------------ */
function puffer(c, f) {
  const sp = f.sp, L = f.size;
  const r = L * 0.32 * (1 + f.inflate * 0.65);
  const wig = Math.sin(f.phase) * 0.4;
  // ekor
  c.fillStyle = sp.fin;
  c.save();
  c.translate(-r * 0.9, 0);
  c.rotate(wig);
  c.beginPath();
  c.moveTo(2, 0);
  c.lineTo(-L * 0.2, -L * 0.12);
  c.lineTo(-L * 0.2, L * 0.12);
  c.closePath();
  c.fill();
  c.restore();
  // duri
  const spikes = 16;
  c.strokeStyle = '#a67c52';
  c.lineWidth = 1.4;
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * TAU;
    const len = 2 + f.inflate * r * 0.35;
    c.beginPath();
    c.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
    c.lineTo(Math.cos(a) * (r + len), Math.sin(a) * (r + len));
    c.stroke();
  }
  // badan bulat
  const g = c.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#f6dd94');
  g.addColorStop(0.6, sp.body);
  g.addColorStop(1, '#c9a24a');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, r * (1.15 - f.inflate * 0.15), r, 0, 0, TAU);
  c.fill();
  c.fillStyle = sp.belly;
  c.beginPath();
  c.ellipse(0, r * 0.35, r * 0.8, r * 0.5, 0, 0, Math.PI);
  c.fill();
  c.fillStyle = 'rgba(90,60,30,.5)';
  for (const [sx, sy] of f.spots) {
    c.beginPath();
    c.arc(sx * r, sy * r, r * 0.08, 0, TAU);
    c.fill();
  }
  c.fillStyle = sp.fin;
  c.beginPath();
  c.ellipse(r * 0.1, r * 0.1, r * 0.25, r * 0.12, 0.6 + Math.sin(f.phase * 1.5) * 0.4, 0, TAU);
  c.fill();
  eye(c, r * 0.55, -r * 0.3, r * 0.2);
  c.fillStyle = '#8a5a2b';
  c.beginPath();
  c.arc(r * 1.05, r * 0.1, 1.8 + f.inflate, 0, TAU);
  c.fill();
}

function turtle(c, f) {
  const L = f.size;
  const flip = Math.sin(f.phase * 0.5);
  // sirip belakang
  c.fillStyle = '#8ab17d';
  c.save();
  c.translate(-L * 0.3, L * 0.06);
  c.rotate(0.5 + flip * 0.3);
  c.beginPath();
  c.ellipse(-L * 0.06, 0, L * 0.1, L * 0.04, 0, 0, TAU);
  c.fill();
  c.restore();
  // sirip depan (jauh)
  c.fillStyle = '#7a9e6d';
  c.save();
  c.translate(L * 0.14, L * 0.02);
  c.rotate(0.7 - flip * 0.6);
  c.beginPath();
  c.ellipse(-L * 0.16, 0, L * 0.2, L * 0.045, 0, 0, TAU);
  c.fill();
  c.restore();
  // kepala & leher
  c.fillStyle = '#a7c957';
  c.beginPath();
  c.ellipse(L * 0.44, -L * 0.03, L * 0.12, L * 0.08, -0.15, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(70,100,40,.45)';
  c.beginPath();
  c.arc(L * 0.42, -L * 0.07, L * 0.025, 0, TAU);
  c.arc(L * 0.48, -L * 0.01, L * 0.02, 0, TAU);
  c.fill();
  eye(c, L * 0.5, -L * 0.06, L * 0.022);
  // perut
  c.fillStyle = '#e9d8a6';
  c.beginPath();
  c.ellipse(0, L * 0.02, L * 0.36, L * 0.07, 0, 0, Math.PI);
  c.fill();
  // tempurung
  const g = c.createLinearGradient(0, -L * 0.25, 0, 0);
  g.addColorStop(0, '#6a994e');
  g.addColorStop(1, '#386641');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, L * 0.02, L * 0.38, L * 0.24, 0, Math.PI, 0);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(30,55,25,.6)';
  c.lineWidth = 1.5;
  c.beginPath();
  for (let i = -2; i <= 2; i++) {
    const x = i * L * 0.12;
    c.moveTo(x - L * 0.05, -L * 0.17 + Math.abs(i) * L * 0.04);
    c.lineTo(x + L * 0.05, -L * 0.17 + Math.abs(i) * L * 0.04);
    c.moveTo(x, -L * 0.17 + Math.abs(i) * L * 0.04);
    c.lineTo(x, L * 0.01);
  }
  c.moveTo(-L * 0.34, -L * 0.07);
  c.quadraticCurveTo(0, -L * 0.14, L * 0.34, -L * 0.07);
  c.stroke();
  // sirip depan (dekat)
  c.fillStyle = '#a7c957';
  c.save();
  c.translate(L * 0.18, L * 0.04);
  c.rotate(0.5 - flip * 0.7);
  c.beginPath();
  c.ellipse(-L * 0.17, 0, L * 0.22, L * 0.05, 0, 0, TAU);
  c.fill();
  c.restore();
}

function shark(c, f) {
  const L = f.size, h = L * 0.17;
  const wig = Math.sin(f.phase * 0.7) * 0.22;
  // ekor bulan sabit
  c.save();
  c.translate(-L * 0.42, 0);
  c.rotate(wig);
  c.fillStyle = '#6b7a89';
  c.beginPath();
  c.moveTo(4, -h * 0.1);
  c.quadraticCurveTo(-L * 0.08, -h * 0.9, -L * 0.2, -h * 2);
  c.quadraticCurveTo(-L * 0.12, -h * 0.4, -L * 0.06, 0);
  c.quadraticCurveTo(-L * 0.12, h * 0.5, -L * 0.16, h * 1.2);
  c.quadraticCurveTo(-L * 0.04, h * 0.6, 4, h * 0.1);
  c.closePath();
  c.fill();
  c.restore();
  // sirip punggung
  c.fillStyle = '#5f6f80';
  c.beginPath();
  c.moveTo(L * 0.06, -h * 0.9);
  c.quadraticCurveTo(-L * 0.06, -h * 1.6, -L * 0.13, -h * 2.3);
  c.quadraticCurveTo(-L * 0.12, -h * 1.3, -L * 0.2, -h * 0.8);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(-L * 0.3, -h * 0.5);
  c.lineTo(-L * 0.35, -h * 1);
  c.lineTo(-L * 0.36, -h * 0.4);
  c.fill();
  // badan
  c.beginPath();
  c.moveTo(L * 0.5, h * 0.05);
  c.bezierCurveTo(L * 0.4, -h * 1.05, -L * 0.15, -h * 1.05, -L * 0.44, -h * 0.15);
  c.lineTo(-L * 0.44, h * 0.15);
  c.bezierCurveTo(-L * 0.15, h * 0.85, L * 0.35, h * 0.9, L * 0.5, h * 0.05);
  c.closePath();
  const g = c.createLinearGradient(0, -h, 0, h);
  g.addColorStop(0, '#5f6f80');
  g.addColorStop(0.5, '#8794a1');
  g.addColorStop(0.58, '#e6ecf1');
  g.addColorStop(1, '#f4f7f9');
  c.fillStyle = g;
  c.fill();
  // sirip dada
  c.fillStyle = '#6b7a89';
  c.beginPath();
  c.moveTo(L * 0.16, h * 0.45);
  c.quadraticCurveTo(L * 0.02, h * 1.3, -L * 0.06, h * 1.9);
  c.quadraticCurveTo(L * 0.04, h * 0.9, -L * 0.02, h * 0.45);
  c.closePath();
  c.fill();
  // insang
  c.strokeStyle = 'rgba(40,50,60,.45)';
  c.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) {
    const x = L * (0.2 + k * 0.03);
    c.beginPath();
    c.moveTo(x, -h * 0.35);
    c.quadraticCurveTo(x - 3, 0, x, h * 0.3);
    c.stroke();
  }
  // mulut & mata
  c.beginPath();
  c.moveTo(L * 0.44, h * 0.35);
  c.quadraticCurveTo(L * 0.38, h * 0.5, L * 0.32, h * 0.38);
  c.stroke();
  c.fillStyle = '#111';
  c.beginPath();
  c.arc(L * 0.37, -h * 0.25, Math.max(1.8, L * 0.012), 0, TAU);
  c.fill();
}

function squid(c, f) {
  const L = f.size;
  const wig = Math.sin(f.phase);
  // tentakel di belakang
  c.strokeStyle = 'rgba(255,150,170,.75)';
  c.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const off = (i - 2.5) * L * 0.035;
    c.lineWidth = i === 0 || i === 5 ? 1.2 : 2;
    c.beginPath();
    c.moveTo(-L * 0.18, off);
    const len = i === 0 || i === 5 ? 0.62 : 0.42;
    c.quadraticCurveTo(-L * 0.35, off + wig * 4 * (i % 2 ? 1 : -1), -L * len, off * 1.6 + Math.sin(f.phase * 1.3 + i) * 5);
    c.stroke();
  }
  // mantel (badan)
  c.beginPath();
  c.moveTo(L * 0.42, 0);
  c.quadraticCurveTo(L * 0.2, -L * 0.13, -L * 0.18, -L * 0.1);
  c.lineTo(-L * 0.18, L * 0.1);
  c.quadraticCurveTo(L * 0.2, L * 0.13, L * 0.42, 0);
  const g = c.createLinearGradient(0, -L * 0.12, 0, L * 0.12);
  g.addColorStop(0, 'rgba(230,80,110,.92)');
  g.addColorStop(1, 'rgba(255,170,190,.92)');
  c.fillStyle = g;
  c.fill();
  // sirip ujung
  c.fillStyle = 'rgba(230,80,110,.8)';
  c.beginPath();
  c.moveTo(L * 0.42, 0);
  c.lineTo(L * 0.26, -L * 0.14 - wig * 2);
  c.lineTo(L * 0.22, 0);
  c.lineTo(L * 0.26, L * 0.14 + wig * 2);
  c.closePath();
  c.fill();
  eye(c, -L * 0.13, -L * 0.03, L * 0.045, '#111', '#ffe9ef');
}

function dumbo(c, f) {
  const L = f.size;
  const flap = Math.sin(f.phase * 0.8);
  const col = '#ff8fb1';
  // lengan berselaput
  c.fillStyle = 'rgba(255,120,160,.75)';
  c.beginPath();
  c.moveTo(-L * 0.32, L * 0.05);
  for (let i = 0; i <= 6; i++) {
    const x = -L * 0.32 + (i / 6) * L * 0.64;
    const y = L * (0.38 + (i % 2 ? 0.06 : 0)) + Math.sin(f.phase + i) * 2;
    c.lineTo(x, y);
  }
  c.lineTo(L * 0.32, L * 0.05);
  c.closePath();
  c.fill();
  // telinga (sirip)
  c.fillStyle = '#ff6b9a';
  for (const s of [-1, 1]) {
    c.save();
    c.translate(s * L * 0.3, -L * 0.18);
    c.rotate(s * (0.4 + flap * 0.5));
    c.beginPath();
    c.ellipse(s * L * 0.12, 0, L * 0.15, L * 0.08, 0, 0, TAU);
    c.fill();
    c.restore();
  }
  // kepala
  const g = c.createRadialGradient(-L * 0.08, -L * 0.25, L * 0.05, 0, -L * 0.05, L * 0.42);
  g.addColorStop(0, '#ffd1df');
  g.addColorStop(1, col);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, -L * 0.08, L * 0.33, L * 0.36, 0, 0, TAU);
  c.fill();
  eye(c, -L * 0.12, -L * 0.02, L * 0.06);
  eye(c, L * 0.12, -L * 0.02, L * 0.06);
  c.fillStyle = 'rgba(255,90,140,.5)';
  c.beginPath();
  c.arc(-L * 0.2, L * 0.08, L * 0.04, 0, TAU);
  c.arc(L * 0.2, L * 0.08, L * 0.04, 0, TAU);
  c.fill();
}

function eel(c, f) {
  const L = f.size;
  const n = 22;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([-t * L, Math.sin(f.phase * 0.8 - i * 0.45) * L * 0.07 * (0.2 + t)]);
  }
  c.strokeStyle = '#1e1a2b';
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    c.lineWidth = Math.max(1.2, L * 0.07 * (1 - i / n));
    c.beginPath();
    c.moveTo(pts[i][0], pts[i][1]);
    c.lineTo(pts[i + 1][0], pts[i + 1][1]);
    c.stroke();
  }
  // mulut raksasa
  const open = 0.5 + Math.sin(f.phase * 0.3) * 0.3;
  c.fillStyle = '#0c0a12';
  c.strokeStyle = '#3a3150';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(L * 0.16, -L * 0.07 * open);
  c.quadraticCurveTo(L * 0.1, L * 0.02, L * 0.17, L * 0.09 * open);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = '#c9c3d9';
  c.beginPath();
  c.arc(L * 0.015, -L * 0.012, 1.6, 0, TAU);
  c.fill();
}

/* ------------------------------------------------------------------ */
/* Ikan dari gambar sendiri (src/assets.js) */
const usesImage = (sp) => !!sp.img && isReady(sp.img);

function imageFish(c, f) {
  const sp = f.sp;
  const img = sp.img;
  const frames = sp.frames || 1;
  const fw = img.naturalWidth / frames;
  const fh = img.naturalHeight;
  const w = f.size * (sp.imgScale || 1);
  const h = (w * fh) / fw;
  const struggle = f.grabbed || f.hooked;
  const puff = 1 + (f.inflate || 0) * 0.5;
  // gambar statis tetap terasa hidup: goyang & sedikit memanjang-memendek
  if (sp.upright && f.vx < 0) c.scale(-1, 1);
  c.rotate(Math.sin(f.phase) * (struggle ? 0.14 : 0.05));
  c.scale((1 + Math.sin(f.phase * 2) * 0.035) * puff, puff);
  const fi = frames > 1 ? Math.floor(performance.now() / (1000 / (sp.fps || 8)) + f.phase * 2) % frames : 0;
  c.drawImage(img, fi * fw, 0, fw, fh, -w / 2, -h / 2, w, h);
}

export function drawFish(c, f) {
  c.save();
  applyTransform(c, f);
  if (usesImage(f.sp)) {
    imageFish(c, f);
    c.restore();
    return;
  }
  if (f.sp.custom && !isBroken(f.sp.img)) {
    // spesies baru yang gambarnya belum selesai dimuat: jangan tampilkan dulu
    // (kalau gambarnya rusak, digambar sebagai ikan oranye bawaan)
    c.restore();
    return;
  }
  switch (f.sp.special) {
    case 'ascii':
      break; // digambar di pass cahaya
    case 'puffer':
      puffer(c, f);
      break;
    case 'turtle':
      turtle(c, f);
      break;
    case 'shark':
      shark(c, f);
      break;
    case 'squid':
      squid(c, f);
      break;
    case 'dumbo':
      dumbo(c, f);
      break;
    case 'eel':
      eel(c, f);
      break;
    default:
      genericFish(c, f);
  }
  c.restore();
}

/* Bagian yang bercahaya (digambar setelah lapisan gelap) */
export function drawFishGlow(c, f, time) {
  const sp = f.sp;
  if (!sp.glow || usesImage(sp)) return;
  const L = f.size;
  c.save();
  applyTransform(c, f);
  switch (sp.glow) {
    case 'ascii': {
      const txt = f.vx >= 0 ? '><(((°>' : '<°)))><';
      c.font = `600 ${Math.round(L * 0.42)}px "JetBrains Mono", monospace`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.shadowColor = '#39ff88';
      c.shadowBlur = 12;
      c.fillStyle = f.grabbed || f.hooked ? '#ff5c7a' : '#39ff88';
      c.fillText(txt, 0, 0);
      break;
    }
    case 'lantern': {
      const h = L * sp.h;
      for (let k = 0; k < 5; k++) dot(c, L * (0.3 - k * 0.15), h * 0.55, 1.4, 4, '170,250,255');
      break;
    }
    case 'hatchet': {
      const h = L * sp.h;
      for (let k = 0; k < 6; k++) dot(c, L * (0.25 - k * 0.1), h * 0.7, 1.3, 3.5, '140,200,255');
      break;
    }
    case 'viper': {
      const h = L * sp.h;
      for (let k = 0; k < 9; k++) dot(c, L * (0.35 - k * 0.09), h * 0.6, 1.1, 3, '120,170,255');
      dot(c, L * 0.3, -h * 0.18, 1.6, 6, '120,200,255');
      break;
    }
    case 'squid': {
      for (let k = 0; k < 6; k++) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.08 + k);
        dot(c, L * (0.32 - k * 0.09), (k % 2 ? 1 : -1) * L * 0.04, 1.3, 3 + pulse * 3, '120,240,255');
      }
      break;
    }
    case 'angler': {
      const h = L * sp.h;
      const bx = L * 0.66, by = -h * 1.25;
      const r = L * 0.75 * (0.85 + 0.15 * Math.sin(time * 0.05 + f.phase));
      const g = c.createRadialGradient(bx, by, 0, bx, by, r);
      g.addColorStop(0, 'rgba(255,230,140,.6)');
      g.addColorStop(1, 'rgba(255,230,140,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(bx, by, r, 0, TAU);
      c.fill();
      c.fillStyle = '#fff6c8';
      c.beginPath();
      c.arc(bx, by, 3, 0, TAU);
      c.fill();
      break;
    }
    case 'eel': {
      const tx = -L, ty = Math.sin(f.phase * 0.8 - 22 * 0.45) * L * 0.07 * 1.2;
      dot(c, tx, ty, 2.2, 10 + Math.sin(time * 0.1) * 3, '255,90,170');
      break;
    }
    default:
      break;
  }
  c.restore();
}

function dot(c, x, y, r, halo, rgb) {
  c.fillStyle = `rgba(${rgb},.2)`;
  c.beginPath();
  c.arc(x, y, halo, 0, TAU);
  c.fill();
  c.fillStyle = `rgba(${rgb},.95)`;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

/* ------------------------------------------------------------------ */
/*  Siluet raksasa di kejauhan                                         */
/* ------------------------------------------------------------------ */
export function drawWhale(c, w) {
  const L = w.size;
  c.save();
  c.translate(w.x, w.y);
  c.scale(w.dir, 1);
  c.globalAlpha = w.alpha;
  c.fillStyle = '#031426';
  // ekor
  c.save();
  c.translate(-L * 0.46, -L * 0.01);
  c.rotate(Math.sin(w.phase) * 0.18);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(-L * 0.06, -L * 0.02, -L * 0.13, -L * 0.09);
  c.quadraticCurveTo(-L * 0.1, -L * 0.01, -L * 0.07, 0);
  c.quadraticCurveTo(-L * 0.1, L * 0.01, -L * 0.13, L * 0.09);
  c.quadraticCurveTo(-L * 0.06, L * 0.02, 0, 0);
  c.fill();
  c.restore();
  // badan
  c.beginPath();
  c.moveTo(L * 0.5, 0);
  c.bezierCurveTo(L * 0.45, -L * 0.12, L * 0.05, -L * 0.13, -L * 0.47, -L * 0.02);
  c.lineTo(-L * 0.47, L * 0.01);
  c.bezierCurveTo(L * 0, L * 0.1, L * 0.4, L * 0.12, L * 0.5, 0);
  c.fill();
  // sirip panjang (paus bungkuk)
  c.save();
  c.translate(L * 0.22, L * 0.06);
  c.rotate(0.5 + Math.sin(w.phase * 0.7) * 0.15);
  c.beginPath();
  c.ellipse(-L * 0.12, 0, L * 0.16, L * 0.025, 0, 0, TAU);
  c.fill();
  c.restore();
  c.restore();
}

export function drawManta(c, m) {
  const L = m.size;
  const flap = Math.sin(m.phase) * 0.35;
  c.save();
  c.translate(m.x, m.y);
  c.scale(m.dir, 1);
  c.globalAlpha = m.alpha;
  c.fillStyle = '#062a45';
  c.beginPath();
  c.moveTo(L * 0.3, 0);
  c.quadraticCurveTo(L * 0.1, -L * (0.15 + flap), -L * 0.05, -L * (0.45 + flap));
  c.quadraticCurveTo(-L * 0.12, -L * 0.1, -L * 0.25, 0);
  c.quadraticCurveTo(-L * 0.12, L * 0.1, -L * 0.05, L * (0.45 - flap));
  c.quadraticCurveTo(L * 0.1, L * (0.15 - flap), L * 0.3, 0);
  c.fill();
  c.strokeStyle = '#062a45';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-L * 0.25, 0);
  c.lineTo(-L * 0.6, Math.sin(m.phase * 0.7) * 6);
  c.stroke();
  c.restore();
}
