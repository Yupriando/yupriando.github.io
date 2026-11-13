/*
 * Mesin kanvas laut: ikan, ubur-ubur, gelembung, makanan, salju laut, cahaya,
 * siluet paus/pari manta, dan mini-game memancing.
 *
 * Interaksi:
 *  - Kursor mendekat     → ikan kabur (ikan buntal menggembung!)
 *  - Tekan & tahan ikan  → ikan dipegang, lepas untuk melempar
 *  - Klik air kosong     → menjatuhkan makanan ikan
 *  - Tarik kail pancing  → umpan menarik ikan; kalau ada yang nyangkut, klik kail untuk menarik
 *  - Ikan ASCII hijau    → "bug", tangkap lalu lepas untuk mem-fix-nya
 */
import { getDepth, getSurfaceY } from '../depth';
import { SPECIES, ZONE_FISH, ZONE_JELLY, SOLO, zoneIndex, applyFishAssets } from './species';
import { drawFish, drawFishGlow, drawWhale, drawManta } from './draw';
import { LITE, canvasDPR } from '../perf';
import { loadImage, isReady, isBroken } from './images';
import { assets } from '../assets';

// Gambar ubur-ubur sendiri (src/assets.js → jellies), dikelompokkan per zona
const JELLY_ITEMS = (assets.jellies?.items || [])
  .filter((it) => it?.src)
  .map((it) => ({ ...it, img: loadImage(it.src), zones: it.zones || [0, 1, 2, 3] }));
// kail + umpan cacing (src/assets.js → hook), kosong = kail garis bawaan
const HOOK_IMG = assets.hook?.src ? loadImage(assets.hook.src) : null;
const HOOK_BARE_IMG = assets.hook?.bare ? loadImage(assets.hook.bare) : null; // kail tanpa cacing
const HOOK_H = assets.hook?.height || 30;
const HOOK_EYE = assets.hook?.eye || [0.78, 0.02];

// pelampung (src/assets.js → bobber), kosong = bola merah-putih bawaan
const FLOAT_IMG = assets.bobber?.src ? loadImage(assets.bobber.src) : null;
const FLOAT_H = assets.bobber?.height || 36;
const FLOAT_WL = assets.bobber?.waterline ?? 0.575;
const FLOAT_EYE = assets.bobber?.eye ?? 0.965;

// pelet makanan ikan (src/assets.js → food), kosong = titik coklat bawaan
const FOOD_IMG = assets.food?.src ? loadImage(assets.food.src) : null;
const FOOD_SIZE = assets.food?.size || 7;

const pickJellyImage = (z) => {
  const list = JELLY_ITEMS.filter((it) => it.zones.includes(z) && !isBroken(it.img));
  if (!list.length) return null;
  // replaceDefault: false → kadang tetap pakai ubur-ubur bawaan
  if (!assets.jellies?.replaceDefault && Math.random() < 1 / (list.length + 1)) return null;
  return list[Math.floor(Math.random() * list.length)];
};

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const CODE_CHARS = ['0', '1', '{}', '</>', ';', '()', '&&', '#', '=>', '[]'];

// Elemen yang klik/sentuhnya tidak boleh diganggu kanvas
const BLOCK_SELECTOR = 'a, button, input, textarea, select, label, .nav, .glass, .hero-content, .boat-wrap, .catch-badge';
// Elemen yang tidak memicu "beri makan" saat diklik
const NO_FEED_SELECTOR = `${BLOCK_SELECTOR}, p, h1, h2, h3, li, pre, .reef-item, .chest`;

const emit = (type, detail = {}) => window.dispatchEvent(new CustomEvent('ocean:fishing', { detail: { type, ...detail } }));

export function createOcean(canvas, { toast = () => {} } = {}) {
  applyFishAssets(); // gambar ikan sendiri dari src/assets.js
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  let W = 0, H = 0, DPR = 1, raf = 0, last = 0, time = 0;
  // ukuran ikan & ubur-ubur ikut lebar layar: 100% di laptop (≥1280px), mengecil sampai 60% di HP (360px)
  // (ukuran di species.js dalam piksel, jadi tanpa ini ikan terlihat raksasa di layar sempit)
  const sizeK = () => clamp(0.6 + (0.4 * (W - 360)) / 920, 0.6, 1);
  // kail & pelampung ikut mengecil di layar sempit (seimbang dengan kapal & ikan)
  const floatH = () => FLOAT_H * sizeK();
  const hookH = () => HOOK_H * sizeK();
  let surf = 0, depth = 0, zone = 0, spawnTimer = 0, lastScroll = window.scrollY;
  let grabbed = null, justDragged = false, hasMouse = false;
  let bugs = 0, catches = 0, bites = 0, toldGrab = false, toldFeed = false;

  const pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0, active: false };
  const fishes = [], jellies = [], bubbles = [], foods = [], snow = [], drops = [], flights = [];
  let giant = null, giantTimer = 300;

  /* ------------------------------ KAIL ------------------------------ */
  const hook = {
    x: 0, y: 0, tx: 0, ty: 0, bobX: 0,
    init: false, visible: false, dragging: false, reeling: false,
    caught: null, biteTime: 0, idle: 999, cooldown: 0, used: false, tip: null,
    baited: true, // masih ada cacingnya? hilang saat ikan menggigit, dipasang lagi setiap kail dilempar
    // lemparan: 'waiting' (kail tergantung di joran) → 'flying' (pelampung melayang) → 'done' (di air)
    // → 'carry' (ikan terangkat ke kapal masih tersangkut di kail) → 'reelup' (kail kembali pelan ke joran;
    //   juga saat kapal keluar layar / satwa dilindungi dilepas) → 'waiting' lagi
    cast: 'waiting', castT: 0, castWait: 0, landX: 0,
    away: false, // kapal/joran sedang di luar layar → kail digulung naik, dilempar lagi saat kapal terlihat
    needReady: false, castQueued: false, reelX: 0, reelAt: null, reelDur: 0,
    carry: null, // lemparan ikan yang sedang terangkat bersama kail (state 'carry')
  };
  const CAST_T = 44; // lama pelampung melayang (frame, ±0,7 detik)
  const REEL_T = 72; // lama kail digulung naik ke joran (frame, ±1,2 detik)

  // mulai menggulung kail dari posisi pelampung di air ke ujung joran
  function startReel(x = hook.bobX, at = null, dur = REEL_T) {
    hook.cast = 'reelup';
    hook.castT = 0;
    hook.reelX = x;
    hook.reelAt = at; // null = dari permukaan air
    hook.reelDur = dur;
    hook.visible = false;
  }
  function advanceReel(dt) {
    if ((hook.castT += dt) < hook.reelDur) return;
    hook.cast = 'waiting';
    hook.castWait = 0;
    if (hook.castQueued) {
      hook.castQueued = false;
      onCast();
    } else if (hook.needReady && !hook.away) {
      hook.needReady = false;
      emit('ready');
    }
  }

  // dipicu Boat.jsx saat si pemancing mengayunkan joran (setelah kapal berhenti, dan lagi setiap habis menarik ikan)
  const onCast = () => {
    // lempar begitu kail kembali ke joran
    if (hook.cast === 'reelup' || hook.cast === 'carry') { hook.castQueued = true; return; }
    if (hook.cast !== 'waiting') return;
    // kapal tidak terlihat → kail tetap tergantung; dilempar saat kapal terlihat lagi (event "ready")
    if (hook.away || !hook.tip || surf < 60 || surf > H - 70) return;
    hook.cast = 'flying';
    hook.castT = 0;
    hook.baited = true; // cacing baru setiap kali dilempar
    hook.landX = hook.tip.x - 48; // jatuh sedikit di depan joran, lalu terseret pelan ke posisi menunggu
  };

  /* ------------------------------ IKAN ------------------------------ */
  class Fish {
    constructor(type, z, x, y, dir) {
      this.type = type;
      this.sp = SPECIES[type];
      this.zone = z;
      this.size = rand(...this.sp.size) * sizeK();
      this.x = x;
      this.y = y;
      this.dir = dir;
      this.base = this.sp.speed * rand(0.8, 1.2);
      this.vx = dir * this.base;
      this.vy = rand(-0.2, 0.2);
      this.angle = dir > 0 ? 0 : Math.PI;
      this.wander = Math.random() * TAU;
      this.phase = Math.random() * TAU;
      this.panic = 0;
      this.inflate = 0;
      this.curious = !this.sp.protect || Math.random() < 0.3 ? Math.random() < 0.75 : false;
      this.spots = Array.from({ length: 7 }, () => [rand(-0.6, 0.6), rand(-0.7, 0.1)]);
      this.grabbed = false;
      this.hooked = false;
      this.leaving = false;
      this.dead = false;
      this.thrown = 0; // sisa waktu meluncur setelah dilempar
    }

    get hitR() {
      return this.size * (this.sp.hit || 0.6);
    }

    update(dt) {
      const sp = this.sp;
      if (sp.special === 'puffer') {
        const near = pointer.active && Math.hypot(pointer.x - this.x, pointer.y - this.y) < 100;
        this.inflate = lerp(this.inflate, this.grabbed || this.hooked || near ? 1 : 0, 0.08 * dt);
      }
      if (this.thrown > 0 && !this.grabbed) {
        // meluncur karena dilempar (hambatan air memperlambat)
        this.thrown -= dt;
        this.vx *= Math.pow(0.95, dt);
        this.vy *= Math.pow(0.95, dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.phase += 0.6 * dt;
        const ta = Math.atan2(this.vy, this.vx);
        this.angle += Math.atan2(Math.sin(ta - this.angle), Math.cos(ta - this.angle)) * Math.min(1, 0.25 * dt);
        // ikan tidak keluar dari air: memantul pelan di bawah permukaan
        const ceil = surf + this.size * 0.5;
        if (this.y < ceil) {
          this.y = ceil;
          if (this.vy < 0) this.vy *= -0.35;
        }
        if (this.y > H - 10) {
          this.y = H - 10;
          this.vy *= -0.4;
        }
        if (this.x < -this.size * 2) this.x = W + this.size;
        else if (this.x > W + this.size * 2) this.x = -this.size;
        if (Math.hypot(this.vx, this.vy) > this.base * 1.8) return;
        this.thrown = 0;
      }
      if (this.grabbed) {
        this.x = lerp(this.x, pointer.x, 0.4);
        // ikan yang dipegang tetap di dalam air
        this.y = Math.max(lerp(this.y, pointer.y, 0.4), surf + this.size * 0.5);
        if (!sp.upright) {
          const face = Math.cos(this.angle) >= 0 ? 0 : Math.PI;
          this.angle = face + Math.sin(time * 0.45) * 0.35; // meronta-ronta
        }
        this.phase += 0.9 * dt;
        return;
      }
      if (this.hooked) {
        // mulut ikan menempel di kail, badan menarik menjauh
        const face = this.pull > 0 ? Math.PI : 0;
        this.angle = face + Math.sin(time * 0.5) * 0.5;
        const L = this.size * 0.42;
        this.x = hook.x - Math.cos(this.angle) * L;
        this.y = hook.y - Math.sin(this.angle) * L;
        this.vx = Math.cos(this.angle);
        this.phase += 0.8 * dt;
        return;
      }

      let ax = 0, ay = 0;
      this.wander += rand(-0.12, 0.12) * dt;
      if (this.leaving) {
        this.dir = this.x < W / 2 ? -1 : 1;
        ax += this.dir * 0.05;
      } else if (Math.random() < 0.0015 * dt) {
        this.dir *= -1;
      }
      ax += this.dir * 0.02;
      ay += Math.sin(this.wander) * (sp.upright ? 0.03 : 0.015);

      // kabur dari kursor
      if (pointer.active && !grabbed) {
        const dx = this.x - pointer.x, dy = this.y - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const R = 110 + this.size * 0.5;
        if (d < R) {
          const f = (1 - d / R) * (sp.bold ? 0.25 : 0.9);
          ax += (dx / d) * f;
          ay += (dy / d) * f;
          if (!sp.bold) this.panic = Math.min(1, this.panic + 0.08 * dt);
        }
      }

      // kejar makanan
      if (foods.length && !this.leaving && !sp.bold) {
        let best = null, bd = 320;
        for (const fd of foods) {
          const d = Math.hypot(fd.x - this.x, fd.y - this.y);
          if (d < bd) { bd = d; best = fd; }
        }
        if (best) {
          ax += ((best.x - this.x) / (bd || 1)) * 0.12;
          ay += ((best.y - this.y) / (bd || 1)) * 0.12;
          if (bd < this.size * 0.45 + 4 && !best.dead) {
            best.dead = true;
            this.size = Math.min(this.size * 1.04, sp.size[1] * 1.5 * sizeK());
            for (let i = 0; i < 2; i++) bubbles.push(new Bubble(this.x, this.y, rand(1.5, 3)));
          }
        }
      }

      // tertarik umpan di kail
      if (hook.visible && hook.baited && !hook.caught && !hook.dragging && hook.cooldown <= 0 && this.curious && !this.leaving) {
        const dx = hook.x - this.x, dy = hook.y - this.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 230) {
          ax += (dx / d) * 0.07;
          ay += (dy / d) * 0.07;
          if (d < this.size * 0.45 + 6) bite(this);
        }
      }

      // bergerombol
      if (sp.school) {
        let n = 0, avx = 0, avy = 0, cx = 0, cy = 0;
        for (const o of fishes) {
          if (o === this || o.type !== this.type || o.grabbed || o.hooked) continue;
          const dx = o.x - this.x, dy = o.y - this.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 8100) {
            n++; avx += o.vx; avy += o.vy; cx += dx; cy += dy;
            if (d2 < this.size * this.size) { ax -= dx * 0.004; ay -= dy * 0.004; }
          }
        }
        if (n) {
          ax += (avx / n - this.vx) * 0.03 + (cx / n) * 0.0015;
          ay += (avy / n - this.vy) * 0.03 + (cy / n) * 0.0015;
        }
      }

      // tetap di dalam air
      if (surf > 0 && this.y < surf) this.y = surf + this.size * 0.5 + rand(0, 40);
      const top = Math.max(surf, 0) + this.size * 0.4 + 20;
      if (this.y < top) ay += (top - this.y) * 0.004 + 0.05;
      if (this.y > H - 20) ay -= (this.y - (H - 20)) * 0.004 + 0.05;

      this.vx += ax * dt;
      this.vy += ay * dt;
      this.vy *= Math.pow(0.97, dt);
      const slow = sp.special === 'puffer' ? 1 - this.inflate * 0.6 : 1;
      const max = this.base * (1 + this.panic * 2.5) * slow;
      let s = Math.hypot(this.vx, this.vy);
      if (s > max) { this.vx *= max / s; this.vy *= max / s; s = max; }
      if (s < this.base * 0.4) this.vx += this.dir * 0.05 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.panic = Math.max(0, this.panic - 0.012 * dt);
      this.phase += (0.12 + s * 0.07) * dt;

      const ta = Math.atan2(this.vy, this.vx);
      const da = Math.atan2(Math.sin(ta - this.angle), Math.cos(ta - this.angle));
      this.angle += da * Math.min(1, 0.12 * dt);

      const m = this.size * 1.2 + 20;
      if (this.x < -m || this.x > W + m) {
        if (this.leaving) this.dead = true;
        else this.x = this.x < -m ? W + m - 1 : -m + 1;
      }
    }
  }

  /* ---------------------------- UBUR-UBUR ---------------------------- */
  class Jelly {
    constructor(z, onScreen) {
      this.zone = z;
      this.size = rand(16, 32) * sizeK();
      this.x = rand(40, Math.max(60, W - 40));
      this.y = onScreen ? rand(Math.max(surf + 60, 60), H) : H + this.size * 3;
      this.phase = Math.random() * TAU;
      this.alpha = onScreen ? 1 : 0;
      this.hue = z === 0 ? rand(190, 220) : z === 1 ? rand(290, 340) : rand(170, 200);
      this.art = pickJellyImage(z);
      if (this.art?.hue != null) this.hue = this.art.hue; // warna cahaya di laut dalam
      this.drift = rand(-0.2, 0.2);
      this.vx = 0;
      this.vy = 0;
      this.grabbed = false;
      this.leaving = false;
      this.dead = false;
    }

    get hitR() {
      return this.size;
    }

    update(dt) {
      if (this.grabbed) {
        this.x = lerp(this.x, pointer.x, 0.3);
        this.y = lerp(this.y, pointer.y, 0.3);
        this.phase += 0.12 * dt;
        return;
      }
      this.phase += 0.045 * dt;
      const pulse = Math.max(0, Math.sin(this.phase));
      this.vy += (-pulse * 0.04 + 0.006) * dt;
      this.vy *= Math.pow(0.97, dt);
      this.vx += this.drift * 0.01 * dt;
      this.vx *= Math.pow(0.98, dt);
      if (pointer.active && !grabbed) {
        const dx = this.x - pointer.x, dy = this.y - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 90) { this.vx += (dx / d) * 0.08; this.vy += (dy / d) * 0.08; }
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      if (this.x < -60) this.x = W + 60;
      if (this.x > W + 60) this.x = -60;
      const top = Math.max(surf, 0);
      if (surf > 0 && this.y < surf + this.size * 2) this.vy += 0.05 * dt;
      else if (this.y < top - this.size * 4) this.y = H + this.size * 3;
      if (this.y > H + this.size * 6) this.y = top - this.size * 3;

      this.alpha = this.leaving ? this.alpha - 0.01 * dt : Math.min(1, this.alpha + 0.01 * dt);
      if (this.alpha <= 0) this.dead = true;
    }

    draw(c) {
      const s = this.size;
      const p = Math.sin(this.phase);
      const sx = 1 + p * 0.08, sy = 1 - p * 0.1;
      const deep = this.zone >= 2;
      if (this.art && isReady(this.art.img)) {
        // ubur-ubur dari gambar: payung berdenyut (melebar-memendek), sedikit bergoyang
        const img = this.art.img;
        const w = s * 2.3 * (this.art.scale || 1);
        const h = (w * img.naturalHeight) / img.naturalWidth;
        c.save();
        c.translate(this.x, this.y - s * 0.75); // titik (0,0) kira-kira di puncak payung
        c.rotate(Math.sin(this.phase * 0.5) * 0.06);
        c.scale(sx, sy);
        c.globalAlpha = Math.max(0, this.alpha) * (deep ? 0.95 : 0.88);
        c.drawImage(img, -w / 2, 0, w, h);
        c.restore();
        return;
      }
      c.save();
      c.translate(this.x, this.y);
      c.globalAlpha = Math.max(0, this.alpha) * (deep ? 0.9 : 0.75);
      c.strokeStyle = `hsla(${this.hue},90%,75%,.45)`;
      c.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        const tx = (i - 2) * s * 0.28 * sx;
        c.beginPath();
        c.moveTo(tx, 0);
        for (let k = 1; k <= 6; k++) {
          c.lineTo(tx + Math.sin(this.phase * 1.3 + k * 0.8 + i) * s * 0.12 * (k / 6 + 0.3), k * s * 0.38);
        }
        c.stroke();
      }
      const g = c.createRadialGradient(0, -s * 0.3, s * 0.1, 0, -s * 0.2, s * 1.1);
      g.addColorStop(0, `hsla(${this.hue},100%,${deep ? 82 : 90}%,.9)`);
      g.addColorStop(1, `hsla(${this.hue},80%,60%,.15)`);
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, s * sx, s * 0.85 * sy, 0, Math.PI, 0);
      c.quadraticCurveTo(0, s * 0.25, -s * sx, 0);
      c.fill();
      c.restore();
    }

    glow(c) {
      if (this.zone < 2) return;
      const r = this.size * 2.4;
      const g = c.createRadialGradient(this.x, this.y - this.size * 0.2, 0, this.x, this.y, r);
      g.addColorStop(0, `hsla(${this.hue},100%,70%,${0.22 * Math.max(0, this.alpha)})`);
      g.addColorStop(1, `hsla(${this.hue},100%,70%,0)`);
      c.fillStyle = g;
      c.beginPath();
      c.arc(this.x, this.y, r, 0, TAU);
      c.fill();
    }
  }

  /* ----------------------------- GELEMBUNG ----------------------------- */
  class Bubble {
    constructor(x, y, r, char = null) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.char = char;
      this.vy = rand(0.4, 1) + r * 0.03;
      this.wob = Math.random() * TAU;
      this.dead = false;
    }
    update(dt) {
      this.wob += 0.05 * dt;
      this.y -= this.vy * dt;
      this.x += Math.sin(this.wob) * 0.3 * dt;
      if (this.y < Math.max(surf, -20)) this.dead = true;
    }
    draw(c) {
      c.beginPath();
      c.arc(this.x, this.y, this.r, 0, TAU);
      c.fillStyle = 'rgba(255,255,255,.06)';
      c.fill();
      c.strokeStyle = 'rgba(200,240,255,.5)';
      c.lineWidth = 1;
      c.stroke();
      c.beginPath();
      c.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.25, 0, TAU);
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.fill();
      if (this.char) {
        c.fillStyle = 'rgba(150,255,240,.85)';
        c.font = `${Math.round(this.r * 0.95)}px "JetBrains Mono", monospace`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(this.char, this.x, this.y + 1);
      }
    }
  }

  const codeBubble = (x, y) => new Bubble(x, y, rand(9, 13), pick(CODE_CHARS));

  /* ------------------------------ HELPER ------------------------------ */
  const targetFish = (z) =>
    Math.round((W < 600 ? 13 : W < 1100 ? 21 : 30) * [1, 1, 0.9, 0.7][z] * (reduce ? 0.5 : 1) * (LITE ? 0.75 : 1) * quality);

  const population = () => {
    let n = 0;
    for (const f of fishes) if (!f.grabbed && !f.hooked && !f.leaving) n += f.sp.weight || 1;
    return n;
  };

  function spawnFish(z, onScreen) {
    const top = Math.max(surf + 30, 20);
    if (top > H - 50) return;
    let type = pick(ZONE_FISH[z]);
    if (SOLO.has(type) && fishes.some((f) => f.type === type)) type = ZONE_FISH[z][0];
    const sp = SPECIES[type];
    const n = sp.school ? sp.school[0] + ((Math.random() * (sp.school[1] - sp.school[0] + 1)) | 0) : 1;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const bx = onScreen ? rand(40, W - 40) : dir > 0 ? -sp.size[1] : W + sp.size[1];
    const by = rand(top + 10, H - 30);
    const spread = sp.school ? Math.max(10, sp.size[1] * 1.2) : 0;
    for (let i = 0; i < n; i++) {
      const x = bx - dir * i * rand(spread * 0.5, spread) + (onScreen ? rand(-30, 30) : 0);
      fishes.push(new Fish(type, z, x, clamp(by + rand(-35, 35), top, H - 20), dir));
    }
  }

  function sweep(arr) {
    let j = 0;
    for (const x of arr) if (!x.dead) arr[j++] = x;
    arr.length = j;
  }

  function hitTest(x, y, touch) {
    const tol = touch ? 16 : 6;
    const above = y < surf;
    for (let i = fishes.length - 1; i >= 0; i--) {
      const f = fishes[i];
      if (above) break; // di atas air tidak ada ikan yang bisa dipegang
      if (!f.dead && !f.hooked && Math.hypot(f.x - x, f.y - y) < f.hitR + tol) return f;
    }
    if (above) return null;
    for (let i = jellies.length - 1; i >= 0; i--) {
      const j = jellies[i];
      if (!j.dead && j.alpha > 0.5 && Math.hypot(j.x - x, j.y - y) < j.hitR + tol) return j;
    }
    return null;
  }

  // kail bisa diklik langsung, atau lewat ikan yang sedang nyangkut
  const hitHook = (x, y, touch) => {
    if (!hook.visible) return false;
    const r = (touch ? 34 : 22) + (hook.caught ? 10 : 0);
    if (Math.hypot(hook.x - x, hook.y - y) < r) return true;
    const f = hook.caught;
    return !!f && Math.hypot(f.x - x, f.y - y) < f.hitR + (touch ? 18 : 10);
  };
  const matches = (t, sel) => !!(t && t.closest && t.closest(sel));

  function burst(x, y, n, code = false) {
    for (let i = 0; i < n; i++) {
      const bx = x + rand(-12, 12), by = y + rand(-12, 12);
      bubbles.push(code && Math.random() < 0.6 ? codeBubble(bx, by) : new Bubble(bx, by, rand(2, 5)));
    }
  }

  function splash(x, y, n) {
    for (let i = 0; i < n; i++) {
      drops.push({ x: x + rand(-8, 8), y, vx: rand(-2.2, 2.2), vy: rand(-5.5, -2), life: 1 });
    }
  }

  function feed(x, y) {
    for (let i = 0; i < 5; i++) {
      foods.push({ x: x + rand(-14, 14), y: y + rand(-8, 8), vy: rand(0.25, 0.5), t: 0, ph: Math.random() * TAU, sz: rand(0.8, 1.2), dead: false });
    }
    burst(x, y, 5);
    if (!toldFeed) {
      toldFeed = true;
      toast('🍤 Fish food dropped! Watch them scramble for it~');
    }
  }

  /* ------------------------- LOGIKA MEMANCING ------------------------- */
  function bite(f) {
    f.hooked = true;
    f.pull = Math.random() < 0.5 ? -1 : 1;
    hook.caught = f;
    hook.baited = false; // cacingnya dimakan, ikan tersangkut di mata kail
    hook.biteTime = 0;
    hook.reeling = false;
    bites++;
    splash(hook.bobX, surf, 6);
    emit('bite', { name: f.sp.name });
    if (bites <= 2) toast(W < 600 ? '🎣 Strike! Tap or drag the hook up to reel in!' : '🎣 Strike! Click / drag the hook upward to reel in the fish!');
  }

  function escape(rebait = true) {
    const f = hook.caught;
    if (!f) return;
    f.hooked = false;
    f.panic = 1;
    f.dir = f.pull;
    f.vx = f.pull * 6;
    f.curious = false;
    hook.caught = null;
    hook.reeling = false;
    hook.cooldown = 90;
    emit('escape', { name: f.sp.name });
    // umpannya sudah dimakan → kail kosong digulung, lalu dilempar lagi (event "ready" → Boat.jsx) dengan cacing baru
    if (rebait && hook.cast === 'done' && !hook.away) {
      hook.needReady = true;
      startReel();
    }
  }

  function land() {
    const f = hook.caught;
    hook.caught = null;
    hook.reeling = false;
    hook.dragging = false;
    hook.cooldown = 120;
    hook.idle = 200;
    root.classList.remove('grabbing');
    f.hooked = false;
    splash(f.x, surf, 14);

    if (f.sp.protect) {
      // satwa dilindungi: langsung dilepas lagi
      f.panic = 1;
      f.curious = false;
      f.y = surf + f.size;
      f.vy = 3;
      hook.castQueued = false;
      startReel(); // kail kosong digulung pelan dari air → lalu dilempar ulang (Boat.jsx, "ocean:cast")
      const msg = f.type === 'turtle' ? '🐢 Sea turtles are protected! Letting it go~' : '🦈 Sharks are protected! Letting it go, careful~';
      toast(msg);
      emit('release', { name: f.sp.name, msg });
      return;
    }

    f.dead = true;
    const bucket = document.getElementById('boat-bucket');
    const r = bucket ? bucket.getBoundingClientRect() : null;
    // ikan terangkat ke ember MASIH tersangkut di kail: titik yang terbang = mata kail, ikan menggantung di bawahnya
    const hang = f.size * 0.42;
    const fl = {
      f,
      t: 0,
      x0: hook.x,
      y0: surf - 4,
      x1: r ? r.left + r.width / 2 : hook.tip.x + 120,
      y1: (r ? r.top + r.height / 2 : hook.tip.y + 60) - hang,
      hang,
      hx: hook.x,
      hy: surf - 4,
    };
    flights.push(fl);
    hook.cast = 'carry';
    hook.carry = fl;
    hook.castQueued = false;
    hook.visible = false;
  }

  function finishFlight(fl) {
    const f = fl.f;
    if (f.type === 'ascii') {
      bugs++;
      toast(`🐛 Caught a bug! Fixed it right away ✅ (bugs fixed: ${bugs})`);
      emit('bug', { bugs, catches });
    } else {
      catches++;
      const rare = f.sp.rare ? ' ✨ Rare!' : '';
      toast(`🎣 Caught a ${f.sp.name}!${rare}`);
      emit('catch', { id: f.type, name: f.sp.name, catches, bugs });
    }
  }

  // kapal/joran keluar layar: kail digulung naik (tidak ikut terbawa saat scroll)
  function reelAway(dt) {
    if (hook.caught) escape(false); // kapal keluar layar: penggulungan diurus di bawah
    hook.dragging = false;
    if (!hook.away) {
      hook.away = true;
      hook.needReady = true;
      if (hook.cast === 'done') startReel();
      else if (hook.cast === 'flying') {
        hook.cast = 'waiting';
        hook.castWait = 0;
      }
    }
    hook.visible = false;
    if (hook.cast === 'reelup') advanceReel(dt); // tetap tergulung walau kapal tak terlihat
  }

  function updateHook(dt) {
    // kapal di luar layar → jangan baca tata letak (mahal saat scroll)
    if (surf < 60 || surf > H - 70) return reelAway(dt);
    const el = document.getElementById('rod-tip');
    if (!el) { hook.visible = false; return; }
    const r = el.getBoundingClientRect();
    hook.tip = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    // ujung joran tertutup / keluar dari atas layar → anggap kapal tidak terlihat
    if (hook.tip.y < 70) return reelAway(dt);
    if (hook.away) {
      // kapal terlihat lagi → minta pemancing melempar kail (Boat.jsx)
      hook.away = false;
      hook.castWait = 0;
      if (hook.cast === 'waiting') {
        hook.needReady = false;
        emit('ready');
      } // masih digulung → "ready" dikirim saat selesai (advanceReel)
    }

    // kail belum dilempar: belum ada di air (tidak digambar & ikan tidak bisa menggigit)
    if (hook.cast !== 'done') {
      hook.visible = false;
      if (hook.cast === 'carry') {
        // ditangani oleh lemparan ikan (lihat update flights)
      } else if (hook.cast === 'reelup') {
        advanceReel(dt);
      } else if (hook.cast === 'waiting') {
        hook.castWait += dt;
        if (hook.castWait > 420) onCast(); // cadangan kalau sinyal dari kapal tidak datang (±7 detik)
      } else if ((hook.castT += dt) >= CAST_T) {
        // pelampung mendarat: cipratan, lalu kail tenggelam pelan ke posisi menunggu
        hook.cast = 'done';
        hook.init = true;
        hook.x = hook.bobX = hook.landX;
        hook.y = surf + 6;
        hook.tx = hook.tip.x - 6;
        hook.ty = surf + Math.min(170, (H - surf) * 0.55);
        splash(hook.landX, surf, 12);
        for (let i = 0; i < 5; i++) bubbles.push(new Bubble(hook.landX + rand(-6, 6), surf + rand(6, 22), rand(1.5, 3.5)));
      }
      return;
    }
    const wasVisible = hook.visible;
    hook.visible = surf > 60 && surf < H - 70 && r.width >= 0;
    if (!hook.visible) {
      if (hook.caught) escape(false);
      hook.baited = true; // kail tak terlihat (di-scroll): umpannya dipasang lagi diam-diam
      hook.dragging = false;
      return;
    }
    const restX = hook.tip.x - 6 + Math.sin(time * 0.02) * 6;
    const restY = surf + Math.min(170, (H - surf) * 0.55);
    if (!hook.init || !wasVisible) {
      if (!hook.init) { hook.x = restX; hook.y = restY; hook.bobX = restX; }
      hook.tx = restX;
      hook.ty = restY;
      hook.init = true;
    }

    if (hook.dragging) {
      hook.tx = pointer.x;
      hook.ty = clamp(pointer.y, surf + 10, H - 10);
    } else if (hook.reeling) {
      hook.tx = lerp(hook.tx, hook.tip.x, 0.03 * dt);
      hook.ty -= 2.4 * dt;
    } else {
      hook.idle += dt;
      if (hook.idle > 240) {
        hook.tx = lerp(hook.tx, restX, 0.02 * dt);
        hook.ty = lerp(hook.ty, restY, 0.02 * dt);
      }
    }

    // ikan yang nyangkut menarik-narik kail
    if (hook.caught) {
      const s = hook.dragging ? 0.6 : 1.6;
      hook.tx += Math.sin(time * 0.35) * s * hook.caught.pull * dt;
      hook.ty += Math.cos(time * 0.27) * s * 0.5 * dt;
      if (!hook.reeling && !hook.dragging) {
        hook.biteTime += dt;
        if (hook.biteTime > 420) escape();
      }
    }
    hook.ty = clamp(hook.ty, surf + 8, H - 10);
    const k = hook.dragging ? 0.35 : 0.08;
    hook.x = lerp(hook.x, hook.tx, Math.min(1, k * dt));
    hook.y = lerp(hook.y, hook.ty, Math.min(1, k * dt));
    hook.bobX = lerp(hook.bobX, hook.x, 0.05 * dt);

    if (hook.caught && hook.y < surf + 18) land();
    if (hook.cooldown > 0) hook.cooldown -= dt;
  }

  function drawHookUnder(c) {
    if (!hook.visible) return;
    const { x, y } = hook;
    c.strokeStyle = 'rgba(255,255,255,.45)';
    c.lineWidth = 1.1;
    c.beginPath();
    // tali ke kail turun dari cincin di bawah pelampung (gambar), atau dari permukaan (pelampung bawaan)
    const startY = isReady(FLOAT_IMG) ? floatWaterY() + (FLOAT_EYE - FLOAT_WL) * floatH() : surf;
    c.moveTo(hook.bobX, startY);
    c.lineTo(x, y - 10);
    c.stroke();
    if (isReady(HOOK_IMG)) {
      // kail + cacing dari gambar: mata kail tepat di ujung tali, bergoyang pelan terbawa arus
      const img = hookImage();
      const h = hookH();
      const w = (h * img.naturalWidth) / img.naturalHeight;
      c.save();
      c.translate(x, y - 10);
      c.rotate(Math.sin(time * 0.05) * 0.12 + (hook.caught ? Math.sin(time * 0.4) * 0.15 : 0));
      c.drawImage(img, -HOOK_EYE[0] * w, -HOOK_EYE[1] * h, w, h);
      c.restore();
    } else drawHookShape(c, x, y);
    drawHookHint(c, x, y);
  }

  // gambar kail sesuai umpan: dengan cacing, atau kosong setelah cacingnya dimakan
  const hookImage = () => (!hook.baited && isReady(HOOK_BARE_IMG) ? HOOK_BARE_IMG : HOOK_IMG);

  // kail bawaan (garis) + cacing, dipakai kalau gambar kail tidak ada
  function drawHookShape(c, x, y) {
    // kail
    c.strokeStyle = '#dfe6ea';
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y - 10);
    c.lineTo(x, y + 3);
    c.arc(x - 5, y + 3, 5, 0, Math.PI, false);
    c.lineTo(x - 10, y - 1);
    c.stroke();
    // umpan cacing
    if (hook.baited) {
      c.strokeStyle = '#ff8fa3';
      c.lineWidth = 3;
      c.beginPath();
      for (let i = 0; i <= 8; i++) {
        const px = x - 9 + Math.sin(time * 0.15 + i) * 1.5;
        const py = y + 2 + i * 1.6;
        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px + Math.sin(i + time * 0.1) * 2, py);
      }
      c.stroke();
    }
  }

  // petunjuk di samping kail
  function drawHookHint(c, x, y) {
    let text, color, wiggle = 0;
    if (hook.caught && !hook.reeling) {
      text = W < 480 ? 'tap the hook → reel in! 🎣' : 'click the hook → reel in! 🎣';
      color = Math.sin(time * 0.2) > 0 ? '#ffd166' : '#fff';
    } else if (!hook.used) {
      text = 'drag my hook';
      color = 'rgba(255,255,255,.85)';
      wiggle = Math.sin(time * 0.08) * 3;
    } else return;
    c.font = `600 ${W < 480 ? 11 : 12}px "JetBrains Mono", monospace`;
    c.textBaseline = 'middle';
    c.fillStyle = color;
    // di kanan kail kalau muat; kalau tidak (layar sempit / kail dekat tepi kanan) pindah ke kiri
    const tw = c.measureText(text).width + 22;
    if (x + 16 + tw < W - 8) {
      c.textAlign = 'left';
      c.fillText((hook.caught ? '' : '← ') + text, x + 16 + wiggle, y);
    } else {
      c.textAlign = 'right';
      c.fillText(text + (hook.caught ? '' : ' →'), x - 16 - wiggle, y);
    }
  }

  // tinggi garis air pelampung (naik-turun pelan; terhentak saat ikan menggigit)
  const floatWaterY = () => surf + (hook.caught ? Math.sin(time * 0.6) * 4 + 4 : Math.sin(time * 0.06) * 1.5);

  /*
   * Pelampung dari gambar (src/assets.js → bobber). waterY = posisi garis air pada pelampung.
   * submerged: bagian di bawah permukaan digambar samar (terendam). Mengembalikan titik ujung antena
   * (tempat tali dari joran) & cincin bawah (tempat tali ke kail).
   */
  function drawFloatImage(c, x, waterY, submerged) {
    const h = floatH();
    const w = (h * FLOAT_IMG.naturalWidth) / FLOAT_IMG.naturalHeight;
    const top = waterY - FLOAT_WL * h;
    if (!submerged) {
      c.drawImage(FLOAT_IMG, x - w / 2, top, w, h);
    } else {
      c.save();
      c.beginPath();
      c.rect(x - w, top - 4, w * 2, surf - top + 4);
      c.clip();
      c.drawImage(FLOAT_IMG, x - w / 2, top, w, h); // di atas air: jelas
      c.restore();
      c.save();
      c.beginPath();
      c.rect(x - w, surf, w * 2, h);
      c.clip();
      c.globalAlpha = 0.45;
      c.drawImage(FLOAT_IMG, x - w / 2, top, w, h); // di bawah air: samar
      c.restore();
    }
    return { top, eye: top + FLOAT_EYE * h };
  }

  function drawBobber(c, x, y) {
    c.fillStyle = '#ff4d4d';
    c.beginPath();
    c.arc(x, y, 5, Math.PI, 0);
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI);
    c.fill();
    c.fillStyle = '#333';
    c.fillRect(x - 0.75, y - 9, 1.5, 4);
  }

  // kail + cacing dengan mata kail di (ex, ey); rot = kemiringan (radian)
  function drawHookAt(c, ex, ey, rot) {
    if (isReady(HOOK_IMG)) {
      const img = hookImage();
      const h = hookH();
      const w = (h * img.naturalWidth) / img.naturalHeight;
      c.save();
      c.translate(ex, ey);
      c.rotate(rot);
      c.drawImage(img, -HOOK_EYE[0] * w, -HOOK_EYE[1] * h, w, h);
      c.restore();
    } else drawHookShape(c, ex, ey + 10);
  }

  /*
   * Pelampung yang menggantung / melayang, dengan kail tergantung di bawahnya.
   * (x, at) = ujung antena pelampung (tempat tali dari joran). Mengembalikan y ujung antena.
   */
  function drawRig(c, x, at, rot) {
    const img = isReady(FLOAT_IMG);
    let eyeY;
    if (img) {
      eyeY = drawFloatImage(c, x, at + FLOAT_WL * floatH(), false).eye;
    } else {
      drawBobber(c, x, at + 9);
      eyeY = at + 14;
    }
    // tali pendek pelampung → kail
    const hx = x + Math.sin(rot) * 8;
    const hy = eyeY + Math.cos(rot) * 8;
    c.strokeStyle = 'rgba(255,255,255,.75)';
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(x, eyeY);
    c.lineTo(hx, hy);
    c.stroke();
    drawHookAt(c, hx, hy, -rot);
  }

  function drawHookAbove(c) {
    if (!hook.tip) return;
    if (hook.cast === 'carry' && hook.carry) {
      // ikan terangkat: tali tegang dari joran ke pelampung, lalu ke kail yang tersangkut di mulut ikan
      const { tip } = hook;
      const { hx, hy } = hook.carry;
      const len = Math.hypot(hx - tip.x, hy - tip.y) || 1;
      const d = Math.min(46, len * 0.45); // pelampung beberapa cm di atas kail
      const img = isReady(FLOAT_IMG);
      const fh = floatH();
      const span = img ? FLOAT_EYE * fh : 14; // antena → cincin bawah
      const bx = hx + ((tip.x - hx) / len) * d;
      const at = hy + ((tip.y - hy) / len) * d - span / 2;
      hook.carry.bx = bx; // diingat → kail kembali ke joran mulai dari posisi pelampung terakhir
      hook.carry.bat = at;
      c.strokeStyle = 'rgba(255,255,255,.8)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.lineTo(bx, at);
      c.stroke();
      let eyeY;
      if (img) eyeY = drawFloatImage(c, bx, at + FLOAT_WL * fh, false).eye;
      else {
        drawBobber(c, bx, at + 9);
        eyeY = at + 14;
      }
      c.beginPath();
      c.moveTo(bx, eyeY);
      c.lineTo(hx, hy);
      c.stroke();
      drawHookAt(c, hx, hy, Math.atan2(hx - bx, hy - eyeY) * -1);
      return;
    }
    if (hook.cast === 'reelup') {
      // digulung: pelampung + kail naik pelan dari air ke ujung joran, tali memendek, sedikit berayun
      if (surf < 60 || surf > H - 70) return;
      const { tip } = hook;
      const p = Math.min(1, hook.castT / (hook.reelDur || REEL_T));
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // pelan → cepat → pelan
      const startAt = hook.reelAt ?? (isReady(FLOAT_IMG) ? surf - FLOAT_WL * floatH() : surf - 16);
      const endAt = tip.y + 8;
      const x = hook.reelX + (tip.x - hook.reelX) * e;
      const at = startAt + (endAt - startAt) * e - Math.sin(Math.PI * p) * 10;
      c.strokeStyle = 'rgba(255,255,255,.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.lineTo(x, at);
      c.stroke();
      drawRig(c, x, at, Math.sin(p * Math.PI * 3) * 0.25 * (1 - p) + Math.sin(time * 0.05) * 0.12 * p);
      return;
    }
    if (hook.cast === 'waiting') {
      // belum dilempar: pelampung + kail tergantung di ujung joran, bergoyang pelan
      if (surf < 60 || surf > H - 70) return;
      const { tip } = hook;
      const sway = Math.sin(time * 0.05) * 0.12;
      const len = 8;
      const x = tip.x + Math.sin(sway) * len;
      const at = tip.y + Math.cos(sway) * len;
      c.strokeStyle = 'rgba(255,255,255,.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.lineTo(x, at);
      c.stroke();
      drawRig(c, x, at, sway * 1.4);
      return;
    }
    if (hook.cast === 'flying') {
      // pelampung terbang melengkung dari ujung joran ke laut, tali ikut terulur
      const { tip } = hook;
      const p = Math.min(1, hook.castT / CAST_T);
      const e = 1 - (1 - p) * (1 - p); // cepat di awal, melambat saat mendekati air
      const img = isReady(FLOAT_IMG);
      const endY = img ? surf : surf - 7; // titik garis air (gambar) / pusat bola (bawaan) saat mendarat
      const tx = tip.x + (hook.landX - tip.x) * e;
      const ty = tip.y + (endY - tip.y) * e - Math.sin(Math.PI * p) * 70;
      // pelampung + kail ikut terbang (kail tertinggal sedikit di belakang), lalu tali ke ujung antena
      const at = img ? ty - FLOAT_WL * floatH() : ty - 9;
      drawRig(c, tx, at, (1 - p) * 0.6);
      c.strokeStyle = 'rgba(255,255,255,.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tip.x, tip.y);
      c.quadraticCurveTo((tip.x + tx) / 2, Math.min(tip.y, at) - 10, tx, at);
      c.stroke();
      return;
    }
    if (!hook.visible) return;
    const { tip } = hook;
    const waterY = floatWaterY();
    const img = isReady(FLOAT_IMG);
    const end = img ? drawFloatImage(c, hook.bobX, waterY, true).top : waterY - 7;
    if (!img) drawBobber(c, hook.bobX, end);
    c.strokeStyle = 'rgba(255,255,255,.75)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(tip.x, tip.y);
    const sag = hook.caught || hook.dragging ? 0 : 26;
    c.quadraticCurveTo((tip.x + hook.bobX) / 2, (tip.y + end) / 2 + sag, hook.bobX, end);
    c.stroke();
  }

  /* ------------------------------ PARALLAX ------------------------------ */
  function applyParallax(sd) {
    const top = Math.max(surf, 0);
    for (const f of fishes) {
      if (f.grabbed || f.hooked) continue;
      f.y -= sd * 0.35;
      if (f.y < top - 80 && surf <= 0) f.y = H + 40;
      else if (f.y > H + 80) f.y = Math.max(top + f.size, -40);
    }
    for (const j of jellies) if (!j.grabbed) j.y -= sd * 0.45;
    for (const b of bubbles) b.y -= sd * 0.5;
    for (const fd of foods) fd.y -= sd * 0.5;
    for (const s of snow) {
      s.y -= sd * 0.6;
      if (s.y < 0) s.y += H;
      else if (s.y > H) s.y -= H;
    }
  }

  /* --------------------------- HEWAN RAKSASA --------------------------- */
  function updateGiant(dt) {
    if (!giant) {
      giantTimer -= dt;
      if (giantTimer <= 0 && zone <= 2 && surf < H * 0.4) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const kind = zone === 0 ? 'manta' : 'whale';
        const size = kind === 'whale' ? clamp(W * 0.55, 320, 760) : clamp(W * 0.18, 120, 220);
        giant = {
          kind, dir, size,
          x: dir > 0 ? -size * 0.6 : W + size * 0.6,
          // posisi tetap di layar (tidak ikut scroll), selalu di bawah permukaan
          y: rand(Math.max(H * 0.35, surf + size * 0.3), H * 0.72),
          phase: 0,
          alpha: kind === 'whale' ? 0.6 : 0.55,
          speed: kind === 'whale' ? 0.45 : 0.8,
        };
      }
      return;
    }
    giant.x += giant.dir * giant.speed * dt;
    giant.phase += (giant.kind === 'whale' ? 0.02 : 0.06) * dt;
    if (giant.x < -giant.size || giant.x > W + giant.size) {
      giant = null;
      giantTimer = rand(900, 1800);
    }
  }

  /* ------------------------------ GAMBAR ------------------------------ */
  /*
   * Cahaya bawah air semi-realistis (tanpa aset):
   *  - sinar matahari: berkas lembut yang memancar dari arah matahari (src/assets.js → sky.sunX),
   *    lebar & terangnya berbeda-beda, berkelip pelan, memudar ke bawah
   *  - riak cahaya (caustics): pola jaring cahaya bergerak tepat di bawah permukaan
   *  - permukaan dari bawah: garis air berkilau & bergelombang
   * Gambar bantu (sprite) dibuat sekali di awal, jadi tiap frame hanya drawImage/pattern (murah).
   */
  const SUN_X = assets.sky?.sunX ?? 0.8;
  const RAYS = Array.from({ length: 9 }, (_, i) => ({
    off: (i - 4) / 4 + rand(-0.08, 0.08), // sebaran sudut dari arah matahari
    w: rand(26, 110),
    a: rand(0.5, 1),
    sp: rand(0.004, 0.011),
    ph: rand(0, TAU),
  }));
  let raySprite = null, causticPat = null, causticTile = null, rayBuf = null;
  const RAY_RES = 0.25; // sinar digambar di kanvas ¼ resolusi lalu diperbesar (sinar memang lembut → tak terlihat beda, jauh lebih ringan)

  function makeRaySprite() {
    // profil lembut: tengah terang, tepi memudar (gauss); atas terang, bawah memudar
    const w = 64, h = 256;
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const g = cv.getContext('2d');
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      const v = Math.pow(1 - y / h, 1.6);
      for (let x = 0; x < w; x++) {
        const d = (x - w / 2) / (w / 2);
        const a = Math.exp(-d * d * 3.2) * v;
        const k = (y * w + x) * 4;
        img.data[k] = 235;
        img.data[k + 1] = 250;
        img.data[k + 2] = 255;
        img.data[k + 3] = Math.round(a * 255);
      }
    }
    g.putImageData(img, 0, 0);
    return cv;
  }

  function makeCausticPattern() {
    // pola jaring cahaya yang bisa diulang (semua frekuensi = kelipatan ukuran ubin → tanpa sambungan)
    const n = 192;
    const cv = document.createElement('canvas');
    cv.width = n;
    cv.height = n;
    const g = cv.getContext('2d');
    const img = g.createImageData(n, n);
    const f = TAU / n;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const u = x * f, v = y * f;
        const a1 = Math.sin(u * 3 + 1.7 * Math.sin(v * 2 + Math.sin(u * 1)));
        const a2 = Math.sin(v * 3 + 1.7 * Math.sin(u * 2 + Math.sin(v * 1) + 1.3));
        const a3 = Math.sin((u + v) * 2 + 1.4 * Math.sin((u - v) * 1 + 0.6));
        const m = Math.min(Math.abs(a1), Math.abs(a2), Math.abs(a3));
        const line = Math.pow(Math.max(0, 1 - m * 3.2), 2.2); // garis tipis terang di tempat gelombang bertemu
        const k = (y * n + x) * 4;
        img.data[k] = 225;
        img.data[k + 1] = 248;
        img.data[k + 2] = 255;
        img.data[k + 3] = Math.round(line * 255);
      }
    }
    g.putImageData(img, 0, 0);
    causticTile = cv;
    return ctx.createPattern(cv, 'repeat');
  }

  function drawRays(top) {
    const fade = clamp(1 - depth / 750, 0, 1);
    if (fade <= 0.01) return;
    if (!raySprite) raySprite = makeRaySprite();
    // sumber cahaya: jauh di atas permukaan, searah matahari di langit
    const sx = W * SUN_X, sy = surf - H * 0.9;
    const len = H * 1.15;
    const bw = Math.max(1, Math.ceil(W * RAY_RES)), bh = Math.max(1, Math.ceil(H * RAY_RES));
    if (!rayBuf) rayBuf = document.createElement('canvas');
    if (rayBuf.width !== bw || rayBuf.height !== bh) {
      rayBuf.width = bw;
      rayBuf.height = bh;
    }
    const b = rayBuf.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, bw, bh);
    let any = false;
    for (const r of RAYS) {
      const flick = 0.55 + 0.45 * Math.sin(time * r.sp + r.ph);
      const a = 0.12 * r.a * flick * fade;
      if (a < 0.004) continue;
      any = true;
      // titik masuk di permukaan, bergeser pelan seperti terbawa ombak
      const ex = sx + r.off * W * 0.55 + Math.sin(time * 0.003 + r.ph) * 30;
      const ang = Math.atan2(ex - sx, top - sy);
      b.globalAlpha = a;
      b.setTransform(RAY_RES, 0, 0, RAY_RES, 0, 0);
      b.translate(ex, top);
      b.rotate(-ang);
      b.drawImage(raySprite, -r.w / 2, 0, r.w, len);
    }
    if (any) ctx.drawImage(rayBuf, 0, 0, W, H);
  }

  let cBuf = null, cPat = null;
  function drawCaustics(top) {
    // hanya dekat permukaan (permukaan terlihat di layar) & tidak di mode ringan
    if (LITE || surf < -260 || surf > H) return;
    const band = Math.min(240, H * 0.35);
    // digambar di kanvas ½ resolusi lalu diperbesar → beban ±4× lebih ringan, riak tetap terlihat
    const R = 0.5;
    const bw = Math.max(1, Math.ceil(W * R)), bh = Math.max(1, Math.ceil(band * R));
    if (!cBuf) cBuf = document.createElement('canvas');
    if (cBuf.width !== bw || cBuf.height !== bh) {
      cBuf.width = bw;
      cBuf.height = bh;
    }
    const b = cBuf.getContext('2d');
    if (!cPat) {
      causticPat = causticPat || makeCausticPattern();
      cPat = b.createPattern(causticTile, 'repeat');
    }
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, bw, bh);
    b.fillStyle = cPat;
    const strips = 8;
    const sh = band / strips;
    // dua lapis bergerak berlawanan arah → pola terlihat "bernapas" seperti riak sungguhan
    for (const [dx, dy, k] of [[time * 0.35, time * 0.18, 1], [-time * 0.27, time * 0.12 + 60, 0.7]]) {
      const ox = ((dx % 192) + 192) % 192, oy = ((dy % 192) + 192) % 192;
      for (let i = 0; i < strips; i++) {
        b.globalAlpha = 0.16 * k * Math.pow(1 - i / strips, 1.5);
        // geser asal pola (bukan kotaknya) → riak cahaya mengalir
        b.setTransform(R, 0, 0, R, 0, 0);
        b.translate(ox, oy);
        b.fillRect(-ox, i * sh - oy, W, sh + 1);
      }
    }
    if (surf + band > top) ctx.drawImage(cBuf, 0, surf, W, band);
  }

  // kilauan matahari di permukaan: garis pendek terang yang berkelip acak, rapat di dekat arah matahari
  const GLINTS = Array.from({ length: 70 }, () => {
    const g = (rand(-1, 1) + rand(-1, 1) + rand(-1, 1)) / 3; // sebaran mengumpul di tengah
    return { g, d: Math.pow(Math.random(), 1.7), len: rand(4, 16), sp: rand(0.05, 0.14), ph: rand(0, TAU) };
  });
  function drawGlints() {
    if (surf < -10 || surf > H) return;
    const band = 9; // hanya di garis permukaan
    const cx = W * SUN_X;
    ctx.fillStyle = 'rgb(255,246,215)';
    for (const p of GLINTS) {
      const tw = Math.sin(time * p.sp + p.ph);
      if (tw <= 0.35) continue;
      const k = (tw - 0.35) / 0.65;
      const y = surf + 3 + p.d * band;
      const spread = 60 + p.d * 90;
      const x = cx + p.g * spread + Math.sin(time * 0.01 + p.ph) * 6;
      ctx.globalAlpha = k * k * (1 - p.d * 0.6) * 0.85;
      const l = p.len * (0.6 + p.d * 0.6);
      ctx.fillRect(x - l / 2, y, l, 1.1);
    }
    ctx.globalAlpha = 1;
  }

  function drawSurfaceUnderside() {
    // permukaan air dilihat dari bawah: pita terang tipis + garis berkilau bergelombang
    if (surf < -10 || surf > H) return;
    const g = ctx.createLinearGradient(0, surf, 0, surf + 26);
    g.addColorStop(0, 'rgba(210,245,255,0.28)');
    g.addColorStop(1, 'rgba(210,245,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, surf, W, 26);
    ctx.strokeStyle = 'rgba(235,252,255,0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) {
      const y = surf + 2.5 + Math.sin(x * 0.035 + time * 0.05) * 1.6 + Math.sin(x * 0.011 - time * 0.03) * 1.4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const top = Math.max(surf, 0);
    if (top < H) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, W, H - top);
      ctx.clip();

      if (level === 0) drawCaustics(top); // kualitas turun otomatis (perangkat lambat) → riak dulu yang dimatikan
      if (level < 2) drawRays(top);
      if (level === 0 || !LITE) drawSurfaceUnderside();
      drawGlints();
      if (giant) (giant.kind === 'whale' ? drawWhale : drawManta)(ctx, giant);

      const snowAmt = level === 0 ? clamp((depth - 150) / 900, 0, 1) : 0;
      if (snowAmt > 0) {
        for (const s of snow) {
          ctx.fillStyle = `rgba(220,235,255,${s.a * snowAmt})`;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      for (const j of jellies) j.draw(ctx);
      ctx.fillStyle = '#d49a5e';
      const pellet = isReady(FOOD_IMG) ? FOOD_IMG : null;
      for (const fd of foods) {
        ctx.globalAlpha = clamp(1 - fd.t / 600, 0, 1);
        if (pellet) {
          // pelet dari gambar: berputar pelan saat tenggelam
          const s = FOOD_SIZE * fd.sz;
          ctx.save();
          ctx.translate(fd.x, fd.y);
          ctx.rotate(fd.ph * 0.6);
          ctx.drawImage(pellet, -s / 2, -s / 2, s, s);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(fd.x, fd.y, 2.5, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      for (const f of fishes) drawFish(ctx, f);
      drawHookUnder(ctx);
      for (const b of bubbles) b.draw(ctx);

      // kegelapan laut dalam — kursor jadi senter
      let dark = clamp((depth - 2500) / 5000, 0, 1) * 0.62;
      if (!hasMouse) dark *= 0.6;
      if (dark > 0) {
        const px = pointer.x > -900 ? pointer.x : W / 2;
        const py = pointer.y > -900 ? pointer.y : H / 2;
        const g = ctx.createRadialGradient(px, py, 30, px, py, Math.max(260, W * 0.22));
        g.addColorStop(0, 'rgba(0,4,14,0)');
        g.addColorStop(1, `rgba(0,4,14,${dark})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, top, W, H - top);
      }

      // pass cahaya (bioluminesensi)
      ctx.globalCompositeOperation = 'lighter';
      for (const j of jellies) j.glow(ctx);
      for (const f of fishes) drawFishGlow(ctx, f, time);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    // di atas permukaan: tali pancing, ikan yang terbang ke kapal, cipratan
    drawHookAbove(ctx);
    for (const fl of flights) {
      drawFish(ctx, fl.f);
      drawFishGlow(ctx, fl.f, time);
    }
    ctx.fillStyle = 'rgba(220,245,255,.85)';
    for (const d of drops) {
      ctx.globalAlpha = d.life;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.8, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------- LOOP ------------------------------- */
  /*
   * Kualitas adaptif: fps TIDAK pernah dibatasi (selalu mengikuti layar, 60/90/120 Hz).
   * Kalau perangkat kewalahan (< ±50 fps cukup lama), yang diturunkan kualitas gambarnya:
   *   level 1 → ikan dikurangi, sinar matahari & salju laut dimatikan
   *   level 2 → resolusi kanvas 1× & ikan dikurangi lagi
   */
  let quality = 1, level = 0, frameMs = 16, slowFor = 0, needResize = false, scrolledAt = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const raw = last ? now - last : 16.67;
    const dt = Math.min(raw / 16.67, 3);
    last = now;
    if (raw < 100) {
      // jeda panjang (tab disembunyikan) tidak dihitung
      frameMs = frameMs * 0.95 + raw * 0.05;
      slowFor = frameMs > 20 ? slowFor + 1 : 0;
      if (slowFor > 60 && level < 2) {
        level++;
        quality = level === 1 ? 0.7 : 0.5;
        if (level === 2) needResize = true; // dibuat ulang nanti saat scroll berhenti
        slowFor = 0;
        frameMs = 16;
      }
    }
    time += dt;

    surf = getSurfaceY();
    depth = getDepth();
    zone = zoneIndex(depth);

    const sd = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    if (sd) scrolledAt = now;
    if (needResize && now - scrolledAt > 400) {
      needResize = false;
      resize();
    }
    if (sd && !reduce) applyParallax(sd);

    // ganti penghuni sesuai zona
    for (const f of fishes) if (!f.grabbed && !f.hooked) f.leaving = f.zone !== zone;
    let jellyCount = 0;
    for (const j of jellies) {
      j.leaving = j.zone !== zone && !j.grabbed;
      if (!j.leaving) jellyCount++;
    }
    spawnTimer -= dt;
    if (spawnTimer <= 0 && population() < targetFish(zone)) {
      spawnFish(zone, false);
      spawnTimer = rand(18, 45);
    }
    if (jellyCount < ZONE_JELLY[zone] && Math.random() < 0.01 * dt) jellies.push(new Jelly(zone, false));

    // gelembung dari dasar, sebagian berisi karakter kode
    if (Math.random() < (W < 600 ? 0.04 : 0.07) * dt) {
      const x = rand(0, W);
      bubbles.push(Math.random() < 0.3 ? codeBubble(x, H + 14) : new Bubble(x, H + 10, rand(2, 6)));
    }

    updateHook(dt);
    updateGiant(dt);
    for (const f of fishes) f.update(dt);
    for (const j of jellies) j.update(dt);
    for (const b of bubbles) b.update(dt);
    for (const fd of foods) {
      fd.t += dt;
      fd.ph += 0.05 * dt;
      fd.y += fd.vy * dt;
      fd.x += Math.sin(fd.ph) * 0.2 * dt;
      if (fd.t > 600 || fd.y > H + 10) fd.dead = true;
    }
    for (const s of snow) {
      s.y += s.vy * dt;
      s.x += Math.sin(time * 0.01 + s.y * 0.01) * 0.1;
      if (s.y > H) { s.y = 0; s.x = rand(0, W); }
    }
    for (const d of drops) {
      d.vy += 0.25 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= 0.025 * dt;
      if (d.life <= 0) d.dead = true;
    }
    for (const fl of flights) {
      fl.t += dt / 55;
      const t = Math.min(1, fl.t);
      // mata kail terangkat melengkung ke ember; ikan menggantung dari mulutnya, berayun & menggelepar
      fl.hx = lerp(fl.x0, fl.x1, t);
      fl.hy = lerp(fl.y0, fl.y1, t) - Math.sin(t * Math.PI) * 130;
      const a = -Math.PI / 2 + Math.sin(t * Math.PI * 4) * 0.45 * (1 - t * 0.6);
      fl.f.angle = a;
      fl.f.x = fl.hx - Math.cos(a) * fl.hang;
      fl.f.y = fl.hy - Math.sin(a) * fl.hang;
      fl.f.vx = fl.x1 >= fl.x0 ? 1 : -1;
      fl.f.phase += 1.4 * dt;
      if (fl.t >= 1) {
        fl.dead = true;
        finishFlight(fl);
        if (hook.carry === fl) {
          // ikan dilepas ke ember → kail kosong berayun pendek kembali ke ujung joran
          hook.carry = null;
          startReel(fl.bx ?? fl.hx, fl.bat ?? fl.hy - 8 - FLOAT_EYE * floatH(), 40);
        }
      }
    }
    sweep(fishes); sweep(jellies); sweep(bubbles); sweep(foods); sweep(drops); sweep(flights);

    draw();
  }

  /* ----------------------------- INTERAKSI ----------------------------- */
  function markDragged() {
    justDragged = true;
    root.dataset.justDragged = '1';
    setTimeout(() => {
      justDragged = false;
      delete root.dataset.justDragged;
    }, 80);
  }

  function onMove(e) {
    const now = performance.now();
    const dtm = Math.max(1, now - pointer.t);
    pointer.vx = ((e.clientX - pointer.x) / dtm) * 16;
    pointer.vy = ((e.clientY - pointer.y) / dtm) * 16;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.t = now;
    if (e.pointerType === 'mouse') {
      hasMouse = true;
      pointer.active = true;
      if (!grabbed && !hook.dragging) {
        const blocked = matches(e.target, BLOCK_SELECTOR);
        const over = !blocked && (hitHook(pointer.x, pointer.y, false) || hitTest(pointer.x, pointer.y, false));
        root.classList.toggle('can-grab', !!over);
        // jejak gelembung kecil
        if (pointer.y > surf && Math.random() < 0.12 && Math.hypot(pointer.vx, pointer.vy) > 3) {
          bubbles.push(new Bubble(pointer.x, pointer.y, rand(1.5, 3.5)));
        }
      }
    }
  }

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.vx = pointer.vy = 0;
    pointer.t = performance.now();
    pointer.active = true;
    if (matches(e.target, BLOCK_SELECTOR)) return;
    const touch = e.pointerType !== 'mouse';

    if (hitHook(e.clientX, e.clientY, touch)) {
      e.preventDefault();
      hook.dragging = true;
      hook.used = true;
      hook.idle = 0;
      if (hook.caught) {
        hook.reeling = true;
        emit('reel', { name: hook.caught.sp.name });
      }
      root.classList.add('grabbing');
      return;
    }

    const hit = hitTest(e.clientX, e.clientY, touch);
    if (!hit) return;
    e.preventDefault();
    grabbed = hit;
    hit.grabbed = true;
    if (hit instanceof Fish) hit.thrown = 0; // ditangkap saat masih meluncur
    root.classList.add('grabbing');
    if (hit instanceof Fish && hit.type === 'ascii') {
      toast('🐛 Bug caught! Let go of it to fix it…');
    } else if (hit instanceof Fish && hit.type === 'puffer') {
      toast('🐡 The pufferfish puffed up in surprise!');
    } else if (!toldGrab) {
      toldGrab = true;
      toast(hit instanceof Jelly ? '🪼 Careful, jellyfish can sting! ⚡' : '🐟 Hehe, that tickles! Drag and let go to toss it 🌊');
    }
  }

  function onUp(e) {
    if (e.pointerType !== 'mouse') pointer.active = false;
    if (hook.dragging) {
      hook.dragging = false;
      hook.idle = 0;
      root.classList.remove('grabbing');
      markDragged();
      return;
    }
    if (!grabbed) return;
    if (performance.now() - pointer.t > 90) pointer.vx = pointer.vy = 0; // kursor sudah diam → lepas pelan
    const f = grabbed;
    grabbed = null;
    f.grabbed = false;
    root.classList.remove('grabbing');
    if (f instanceof Fish) {
      // lemparan: kecepatan mengikuti gerakan kursor/jari
      f.vx = clamp(pointer.vx * 0.9, -22, 22);
      f.vy = clamp(pointer.vy * 0.9, -21, 22);
      f.panic = 1;
      if (f.vx) f.dir = Math.sign(f.vx);
      if (f.type === 'ascii') {
        f.dead = true;
        bugs++;
        burst(f.x, f.y, 12, true);
        toast(`✅ Bug #${bugs} fixed! git commit -m "fix: bug ${bugs}"`);
        emit('bug', { bugs, catches });
      } else {
        f.thrown = 45;
      }
    } else {
      f.vx = clamp(pointer.vx * 0.6, -14, 14);
      f.vy = clamp(pointer.vy * 0.6, -14, 14);
    }
    markDragged();
  }

  function onClick(e) {
    if (justDragged || matches(e.target, NO_FEED_SELECTOR)) return;
    if (e.clientY > surf + 10) feed(e.clientX, e.clientY);
  }

  // di layar sentuh: cegah scroll hanya kalau jari menyentuh ikan / kail
  function onTouchStart(e) {
    if (e.touches.length !== 1 || matches(e.target, BLOCK_SELECTOR)) return;
    const t = e.touches[0];
    if (hitHook(t.clientX, t.clientY, true) || hitTest(t.clientX, t.clientY, true)) e.preventDefault();
  }
  function onTouchMove(e) {
    if (grabbed || hook.dragging) e.preventDefault();
  }

  // gelembung dari karang yang diklik
  function onBubbles(e) {
    const { x, y } = e.detail;
    burst(x, y, 10, Math.random() < 0.5);
  }

  const viewportW = () => canvas.clientWidth || document.documentElement.clientWidth || window.innerWidth;

  function resize() {
    DPR = level >= 2 ? 1 : canvasDPR();
    // lebar TANPA scrollbar (sama dengan lebar kanvas di CSS). window.innerWidth ikut menghitung scrollbar,
    // sehingga isi kanvas terskala & semua gambar (tali pancing, ikan, kail) bergeser beberapa px.
    const k0 = W ? sizeK() : 0;
    W = viewportW();
    // layar berubah lebar (HP diputar, jendela di-resize) → ikan yang sudah ada ikut menyesuaikan ukuran
    if (k0 && sizeK() !== k0) {
      const r = sizeK() / k0;
      for (const f of fishes) f.size *= r;
      for (const j of jellies) j.size *= r;
    }
    H = LITE ? Math.max(window.innerHeight, canvas.clientHeight || 0) : window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!snow.length) {
      const n = W < 600 ? 40 : 80;
      for (let i = 0; i < n; i++) {
        snow.push({ x: rand(0, W), y: rand(0, H), r: rand(0.8, 2), vy: rand(0.1, 0.35), a: rand(0.2, 0.7) });
      }
    }
  }

  /* ------------------------------- MULAI ------------------------------- */
  resize();
  surf = getSurfaceY();
  depth = getDepth();
  zone = zoneIndex(depth);
  for (let i = 0; i < 12 && population() < targetFish(zone); i++) spawnFish(zone, true);
  for (let i = 0; i < ZONE_JELLY[zone]; i++) jellies.push(new Jelly(zone, true));

  // di HP, address bar yang muncul/hilang saat scroll memicu resize kecil → abaikan
  const onResize = () => {
    if (LITE && viewportW() === W && Math.abs(window.innerHeight - H) < 160) return;
    resize();
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  window.addEventListener('click', onClick);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('ocean:bubbles', onBubbles);
  window.addEventListener('ocean:cast', onCast);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('click', onClick);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('ocean:bubbles', onBubbles);
    window.removeEventListener('ocean:cast', onCast);
    root.classList.remove('can-grab', 'grabbing');
  };
}
