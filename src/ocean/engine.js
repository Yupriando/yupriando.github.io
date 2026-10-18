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
import { airFish } from './shared';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const CODE_CHARS = ['0', '1', '{}', '</>', ';', '()', '&&', '#', '=>', '[]'];

// Teriakan ikan saat terbang di udara
const AIR_QUOTES = [
  'Wiii~! 🎢',
  'Aku bisa terbang!',
  'Tolooong!! 😱',
  '404: air not found',
  'Yippee! ✨',
  'Airnya manaaa?',
  'sudo turunin aku',
  'Ini bukan bug, ini fitur!',
  'Weee~',
  'Aaaaa!',
];
const GRAVITY = 0.38;

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
  let surf = 0, depth = 0, zone = 0, spawnTimer = 0, lastScroll = window.scrollY;
  let grabbed = null, justDragged = false, hasMouse = false;
  let bugs = 0, catches = 0, bites = 0, toldGrab = false, toldFeed = false, toldFly = false;

  const pointer = { x: -999, y: -999, vx: 0, vy: 0, t: 0, active: false };
  const fishes = [], jellies = [], bubbles = [], foods = [], snow = [], drops = [], flights = [];
  let giant = null, giantTimer = 300;

  /* ------------------------------ KAIL ------------------------------ */
  const hook = {
    x: 0, y: 0, tx: 0, ty: 0, bobX: 0,
    init: false, visible: false, dragging: false, reeling: false,
    caught: null, biteTime: 0, idle: 999, cooldown: 0, used: false, tip: null,
  };

  /* ------------------------------ IKAN ------------------------------ */
  class Fish {
    constructor(type, z, x, y, dir) {
      this.type = type;
      this.sp = SPECIES[type];
      this.zone = z;
      this.size = rand(...this.sp.size);
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
      this.airborne = false; // sedang terbang di atas permukaan
      this.spin = 0;
      this.airT = 0;
      this.quote = '';
    }

    get hitR() {
      return this.size * (this.sp.hit || 0.6);
    }

    // keluar dari air → terbang mengikuti gravitasi
    launch() {
      this.airborne = true;
      this.thrown = 0;
      this.airT = 0;
      this.spin = rand(0.12, 0.3) * (Math.random() < 0.5 ? -1 : 1) + this.vx * 0.01;
      this.quote = pick(AIR_QUOTES);
      airFish.add(this);
      if (surf > -20 && surf < H) splash(this.x, surf, 12);
      if (!toldFly) {
        toldFly = true;
        toast('🚀 Ikan terbang! Lempar lebih tinggi, siapa tahu disambar burung camar 🐦');
      }
    }

    // jatuh kembali ke laut
    splashdown() {
      this.airborne = false;
      airFish.delete(this);
      this.vx *= 0.5;
      this.vy *= 0.3;
      this.thrown = 30;
      this.panic = 1;
      if (this.vx) this.dir = Math.sign(this.vx);
      splash(this.x, surf, 16);
      for (let i = 0; i < 6; i++) bubbles.push(new Bubble(this.x + rand(-10, 10), surf + rand(8, 30), rand(2, 4.5)));
    }

    update(dt) {
      const sp = this.sp;
      if (sp.special === 'puffer') {
        const near = pointer.active && Math.hypot(pointer.x - this.x, pointer.y - this.y) < 100;
        this.inflate = lerp(this.inflate, this.grabbed || this.hooked || this.airborne || near ? 1 : 0, 0.08 * dt);
      }
      if (this.stolen) {
        // disambar burung camar
        this.dead = true;
        airFish.delete(this);
        return;
      }
      if (this.airborne) {
        this.vy += GRAVITY * dt;
        this.vx *= Math.pow(0.995, dt);
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle += this.spin * dt;
        this.phase += 0.7 * dt;
        this.airT += dt;
        if (this.x < -this.size * 2) this.x = W + this.size;
        else if (this.x > W + this.size * 2) this.x = -this.size;
        if (this.vy > 0 && this.y > surf) this.splashdown();
        return;
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
        if (this.y < surf && this.vy < -1.5) {
          this.launch();
          return;
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
        this.y = lerp(this.y, pointer.y, 0.4);
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
            this.size = Math.min(this.size * 1.04, sp.size[1] * 1.5);
            for (let i = 0; i < 2; i++) bubbles.push(new Bubble(this.x, this.y, rand(1.5, 3)));
          }
        }
      }

      // tertarik umpan di kail
      if (hook.visible && !hook.caught && !hook.dragging && hook.cooldown <= 0 && this.curious && !this.leaving) {
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
      this.size = rand(16, 32);
      this.x = rand(40, Math.max(60, W - 40));
      this.y = onScreen ? rand(Math.max(surf + 60, 60), H) : H + this.size * 3;
      this.phase = Math.random() * TAU;
      this.alpha = onScreen ? 1 : 0;
      this.hue = z === 0 ? rand(190, 220) : z === 1 ? rand(290, 340) : rand(170, 200);
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
    Math.round((W < 600 ? 13 : W < 1100 ? 21 : 30) * [1, 1, 0.9, 0.7][z] * (reduce ? 0.5 : 1));

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
      if (above && !f.airborne) continue; // di atas air hanya ikan yang sedang terbang
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
      foods.push({ x: x + rand(-14, 14), y: y + rand(-8, 8), vy: rand(0.25, 0.5), t: 0, ph: Math.random() * TAU, dead: false });
    }
    burst(x, y, 5);
    if (!toldFeed) {
      toldFeed = true;
      toast('🍤 Makanan ikan dijatuhkan! Lihat mereka berebut~');
    }
  }

  /* ------------------------- LOGIKA MEMANCING ------------------------- */
  function bite(f) {
    f.hooked = true;
    f.pull = Math.random() < 0.5 ? -1 : 1;
    hook.caught = f;
    hook.biteTime = 0;
    hook.reeling = false;
    bites++;
    splash(hook.bobX, surf, 6);
    emit('bite', { name: f.sp.name });
    if (bites <= 2) toast('🎣 Strike! Klik / tarik kailnya ke atas untuk menarik ikan!');
  }

  function escape() {
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
      const msg = f.type === 'turtle' ? '🐢 Penyu itu dilindungi! Dilepas lagi ya~' : '🦈 Hiu dilindungi! Dilepas lagi, hati-hati~';
      toast(msg);
      emit('release', { name: f.sp.name, msg });
      return;
    }

    f.dead = true;
    const bucket = document.getElementById('boat-bucket');
    const r = bucket ? bucket.getBoundingClientRect() : null;
    flights.push({
      f,
      t: 0,
      x0: f.x,
      y0: surf - 4,
      x1: r ? r.left + r.width / 2 : hook.tip.x + 120,
      y1: r ? r.top + r.height / 2 : hook.tip.y + 60,
    });
  }

  function finishFlight(fl) {
    const f = fl.f;
    if (f.type === 'ascii') {
      bugs++;
      toast(`🐛 Dapat bug! Langsung di-fix ✅ (total bug: ${bugs})`);
      emit('bug', { bugs, catches });
    } else {
      catches++;
      const rare = f.sp.rare ? ' ✨ Langka!' : '';
      toast(`🎣 Dapat ${f.sp.name}!${rare}`);
      emit('catch', { name: f.sp.name, catches, bugs });
    }
  }

  function updateHook(dt) {
    const el = document.getElementById('rod-tip');
    if (!el) { hook.visible = false; return; }
    const r = el.getBoundingClientRect();
    hook.tip = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const wasVisible = hook.visible;
    hook.visible = surf > 60 && surf < H - 70 && r.width >= 0;
    if (!hook.visible) {
      if (hook.caught) escape();
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
    c.moveTo(hook.bobX, surf);
    c.lineTo(x, y - 10);
    c.stroke();
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
    if (!hook.caught) {
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
    // petunjuk
    c.font = '600 12px "JetBrains Mono", monospace';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    if (hook.caught && !hook.reeling) {
      c.fillStyle = Math.sin(time * 0.2) > 0 ? '#ffd166' : '#fff';
      c.fillText('klik kail → tarik! 🎣', x + 16, y);
    } else if (!hook.used) {
      c.fillStyle = 'rgba(255,255,255,.85)';
      c.fillText('← tarik kailku', x + 16 + Math.sin(time * 0.08) * 3, y);
    }
  }

  function drawHookAbove(c) {
    if (!hook.visible || !hook.tip) return;
    const { tip } = hook;
    const by = surf - 7 + (hook.caught ? Math.sin(time * 0.6) * 4 + 4 : Math.sin(time * 0.06) * 1.5);
    c.strokeStyle = 'rgba(255,255,255,.75)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(tip.x, tip.y);
    const sag = hook.caught || hook.dragging ? 0 : 26;
    c.quadraticCurveTo((tip.x + hook.bobX) / 2, (tip.y + by) / 2 + sag, hook.bobX, by);
    c.stroke();
    // pelampung
    c.fillStyle = '#ff4d4d';
    c.beginPath();
    c.arc(hook.bobX, by, 5, Math.PI, 0);
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(hook.bobX, by, 5, 0, Math.PI);
    c.fill();
    c.fillStyle = '#333';
    c.fillRect(hook.bobX - 0.75, by - 9, 1.5, 4);
  }

  /* ------------------------------ PARALLAX ------------------------------ */
  function applyParallax(sd) {
    const top = Math.max(surf, 0);
    for (const f of fishes) {
      if (f.grabbed || f.hooked) continue;
      if (f.airborne) {
        f.y -= sd; // ikan di udara ikut bergerak bersama permukaan laut
        continue;
      }
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
  function drawRays(top) {
    const a = clamp(1 - depth / 700, 0, 1) * 0.09;
    if (a <= 0.002) return;
    const g = ctx.createLinearGradient(0, top, 0, top + H * 0.9);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    for (let i = 0; i < 5; i++) {
      const x0 = W * (i / 5 + 0.08) + Math.sin(time * 0.006 + i * 1.7) * 40;
      ctx.beginPath();
      ctx.moveTo(x0 - 20, top);
      ctx.lineTo(x0 + 30, top);
      ctx.lineTo(x0 + 190, top + H);
      ctx.lineTo(x0 + 60, top + H);
      ctx.closePath();
      ctx.fill();
    }
  }

  const aboveWater = (f) => f.airborne || (f.grabbed && f.y < surf);

  function drawQuote(f) {
    const a = clamp(Math.min(f.airT / 8, (80 - f.airT) / 15), 0, 1);
    ctx.globalAlpha = a;
    ctx.font = '700 13px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(4,20,44,.85)';
    const y = f.y - f.size * 0.7 - 8;
    ctx.strokeText(f.quote, f.x, y);
    ctx.fillStyle = '#fff';
    ctx.fillText(f.quote, f.x, y);
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const top = Math.max(surf, 0);
    if (top < H) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, W, H - top);
      ctx.clip();

      drawRays(top);
      if (giant) (giant.kind === 'whale' ? drawWhale : drawManta)(ctx, giant);

      const snowAmt = clamp((depth - 150) / 900, 0, 1);
      if (snowAmt > 0) {
        for (const s of snow) {
          ctx.fillStyle = `rgba(220,235,255,${s.a * snowAmt})`;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      for (const j of jellies) j.draw(ctx);
      ctx.fillStyle = '#d49a5e';
      for (const fd of foods) {
        ctx.globalAlpha = clamp(1 - fd.t / 600, 0, 1);
        ctx.beginPath();
        ctx.arc(fd.x, fd.y, 2.5, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (const f of fishes) if (!aboveWater(f)) drawFish(ctx, f);
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
      for (const f of fishes) if (!aboveWater(f)) drawFishGlow(ctx, f, time);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    // di atas permukaan: tali pancing, ikan yang terbang ke kapal, cipratan
    drawHookAbove(ctx);
    for (const fl of flights) {
      drawFish(ctx, fl.f);
      drawFishGlow(ctx, fl.f, time);
    }
    // ikan yang dilempar ke udara (atau dipegang di atas air)
    for (const f of fishes) {
      if (!aboveWater(f)) continue;
      drawFish(ctx, f);
      drawFishGlow(ctx, f, time);
      if (f.airborne && f.airT < 80) drawQuote(f);
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
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
    last = now;
    time += dt;

    surf = getSurfaceY();
    depth = getDepth();
    zone = zoneIndex(depth);

    const sd = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
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
      fl.f.x = lerp(fl.x0, fl.x1, t);
      fl.f.y = lerp(fl.y0, fl.y1, t) - Math.sin(t * Math.PI) * 130;
      fl.f.angle += 0.25 * dt;
      fl.f.phase += 0.9 * dt;
      if (fl.t >= 1) {
        fl.dead = true;
        finishFlight(fl);
      }
    }
    sweep(fishes); sweep(jellies); sweep(bubbles); sweep(foods); sweep(drops); sweep(flights);
    for (const f of airFish) if (f.dead || !f.airborne) airFish.delete(f);

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
    if (hit instanceof Fish) {
      // ditangkap di udara / saat meluncur
      hit.airborne = false;
      hit.thrown = 0;
      airFish.delete(hit);
    }
    root.classList.add('grabbing');
    if (hit instanceof Fish && hit.type === 'ascii') {
      toast('🐛 Bug ketangkap! Lepaskan untuk mem-fix-nya…');
    } else if (hit instanceof Fish && hit.type === 'puffer') {
      toast('🐡 Ikan buntalnya menggembung karena kaget!');
    } else if (!toldGrab) {
      toldGrab = true;
      toast(hit instanceof Jelly ? '🪼 Hati-hati, ubur-ubur bisa nyetrum! ⚡' : '🐟 Hehe, ikannya geli! Coba lempar kencang ke atas laut 🚀');
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
      } else if (f.y < surf) {
        f.launch(); // dilepas di atas air → langsung terbang/jatuh
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

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
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

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  window.addEventListener('click', onClick);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('ocean:bubbles', onBubbles);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    window.removeEventListener('click', onClick);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('ocean:bubbles', onBubbles);
    root.classList.remove('can-grab', 'grabbing');
    airFish.clear();
  };
}
