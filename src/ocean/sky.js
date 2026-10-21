/*
 * Burung camar di langit hero.
 *  - Kursor mendekat → burung kaget, terbang menjauh lebih cepat
 *  - Klik burung     → menyelam ke laut menangkap ikan, lalu terbang membawa hasil tangkapan
 */
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

import { airFish } from './shared';
import { drawFish, drawFishGlow } from './draw';
import { SPECIES, ZONE_FISH, applyFishAssets } from './species';
import { loadImage, isReady } from './images';
import { assets } from '../assets';
import { canvasDPR } from '../perf';

const BLOCK_SELECTOR = 'a, button, input, textarea, .nav';

export function createSky(canvas, hero, { toast = () => {} } = {}) {
  applyFishAssets();
  // gambar burung sendiri (src/assets.js), kosong = burung bawaan
  const birdFrames = (assets.bird?.frames || []).filter(Boolean).map(loadImage);
  const birdScale = assets.bird?.scale || 1;
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1, seaY = 0, raf = 0, last = 0, time = 0;
  let visible = true, spawnTimer = 0, toldDive = false, toldCatch = false, toldSnatch = false;
  const birds = [], drops = [];
  const pointer = { x: -999, y: -999 };

  class Bird {
    constructor(onScreen) {
      this.dir = Math.random() < 0.5 ? 1 : -1;
      this.size = rand(18, 28) * (W < 600 ? 0.8 : 1);
      this.x = onScreen ? rand(W * 0.1, W * 0.9) : this.dir > 0 ? -50 : W + 50;
      this.y = rand(H * 0.12, seaY * 0.6);
      this.speed = rand(1, 1.7);
      this.vx = this.dir * this.speed;
      this.vy = 0;
      this.flap = Math.random() * TAU;
      this.bob = Math.random() * TAU;
      this.glide = 0;
      this.startle = 0;
      this.state = 'fly';
      this.carryFish = null;
      this.timer = 0;
      this.dead = false;
    }

    hit(x, y) {
      return this.state === 'fly' && Math.hypot(x - this.x, y - this.y) < this.size * 0.8 + 10;
    }

    dive() {
      this.state = 'dive';
      this.vy = -1.5;
      this.vx = this.dir * 1.6;
      this.glide = 0;
    }

    update(dt) {
      if (this.carryFish) this.carryFish.phase += 0.8 * dt; // ikan meronta di paruh
      if (this.state === 'fly') {
        if (this.glide > 0) this.glide -= dt;
        else if (Math.random() < 0.004 * dt) this.glide = rand(40, 120);
        this.flap += (this.startle > 0 ? 0.55 : this.glide > 0 ? 0 : 0.22) * dt;
        this.bob += 0.03 * dt;

        const d = Math.hypot(pointer.x - this.x, pointer.y - this.y);
        if (d < 90 && this.startle <= 0) {
          this.startle = 70;
          this.vy = -3.2;
          this.glide = 0;
          if (Math.sign(this.x - pointer.x) !== this.dir && Math.random() < 0.5) this.dir *= -1;
        }
        if (this.startle > 0) {
          this.startle -= dt;
          this.vx = lerp(this.vx, this.dir * this.speed * 2.6, 0.1);
        } else {
          this.vx = lerp(this.vx, this.dir * this.speed, 0.05);
        }
        this.vy = lerp(this.vy, Math.sin(this.bob) * 0.4, 0.04);
        this.x += this.vx * dt;
        this.y = clamp(this.y + this.vy * dt, 16, seaY - 50);
        if (this.x < -90 || this.x > W + 90) this.dead = true;
      } else if (this.state === 'dive') {
        this.vy += 0.4 * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.y >= seaY + 4) {
          splash(this.x, seaY, 18);
          this.state = 'under';
          this.timer = 20;
          this.success = Math.random() < 0.75;
        }
      } else if (this.state === 'under') {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.state = 'rise';
          this.y = seaY;
          this.vy = -6.5;
          splash(this.x, seaY, 10);
          if (this.success) {
            this.carryFish = catchFor(this);
            if (!toldCatch && this.carryFish) {
              toldCatch = true;
              toast(`🐟 Hap! Burungnya dapat ${this.carryFish.sp.name}!`);
            }
          }
        }
      } else if (this.state === 'rise') {
        this.vy += 0.14 * dt;
        this.flap += 0.5 * dt;
        this.x += this.dir * 2.4 * dt;
        this.y += this.vy * dt;
        if (this.vy >= -0.4) {
          this.state = 'fly';
          this.speed = 2;
          this.startle = 40;
        }
      }
    }

    draw(c) {
      if (this.state === 'under') return;
      const s = this.size;
      c.save();
      c.translate(this.x, this.y);
      c.scale(this.dir, 1);
      let rot = 0;
      if (this.state === 'dive') rot = Math.atan2(this.vy, Math.abs(this.vx)) * 0.9;
      else if (this.state === 'rise') rot = Math.atan2(this.vy, 2.4) * 0.6;
      c.rotate(rot);

      const lift = this.state === 'dive' ? -0.15 : this.glide > 0 && this.startle <= 0 ? 0.25 : Math.sin(this.flap);

      if (birdFrames.length && drawBirdImage(c, s, lift)) {
        c.restore();
        this.drawCarry(c, rot);
        return;
      }

      wing(c, s, lift, '#aeb8c2', false);
      // ekor
      c.fillStyle = '#dfe4ea';
      c.beginPath();
      c.moveTo(-s * 0.36, -s * 0.04);
      c.lineTo(-s * 0.62, -s * 0.1);
      c.lineTo(-s * 0.58, s * 0.06);
      c.closePath();
      c.fill();
      // badan
      const g = c.createLinearGradient(0, -s * 0.14, 0, s * 0.14);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#d9dee4');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, s * 0.42, s * 0.14, 0, 0, TAU);
      c.fill();
      // kepala
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(s * 0.38, -s * 0.07, s * 0.13, 0, TAU);
      c.fill();
      // paruh
      c.fillStyle = '#ffb703';
      c.beginPath();
      c.moveTo(s * 0.48, -s * 0.09);
      c.lineTo(s * 0.68, -s * 0.05);
      c.lineTo(s * 0.48, -s * 0.02);
      c.closePath();
      c.fill();
      c.fillStyle = '#e76f51';
      c.beginPath();
      c.arc(s * 0.6, -s * 0.045, s * 0.018 + 0.4, 0, TAU);
      c.fill();
      // mata
      c.fillStyle = '#1b1b2f';
      c.beginPath();
      c.arc(s * 0.42, -s * 0.1, s * 0.025 + 0.7, 0, TAU);
      c.fill();
      wing(c, s, lift, '#cfd6dd', true);
      c.restore();
      this.drawCarry(c, rot);
    }

    // ikan di paruh (ukuran & corak sama seperti di laut, termasuk gambar sendiri)
    drawCarry(c, rot) {
      const f = this.carryFish;
      if (f) {
        const s = this.size;
        const lx = s * 0.62, ly = -s * 0.02; // posisi paruh (koordinat lokal burung)
        const bx = this.x + this.dir * (Math.cos(rot) * lx - Math.sin(rot) * ly);
        const by = this.y + Math.sin(rot) * lx + Math.cos(rot) * ly;
        f.x = bx;
        f.y = by + f.size * 0.12;
        f.angle = (this.dir > 0 ? 0 : Math.PI) + Math.sin(time * 0.45) * 0.35;
        drawFish(c, f);
        drawFishGlow(c, f, time);
      }
    }
  }

  // burung dari gambar: beberapa frame = animasi kepakan, satu frame = efek mengepak sederhana
  function drawBirdImage(c, s, lift) {
    const n = birdFrames.length;
    const idx = n > 1 ? Math.min(n - 1, Math.floor(((1 - lift) / 2) * n)) : 0;
    const img = birdFrames[idx];
    if (!isReady(img)) return false;
    const w = s * 1.5 * birdScale;
    const h = (w * img.naturalHeight) / img.naturalWidth;
    if (n === 1) c.scale(1, 1 - lift * 0.12);
    c.drawImage(img, -w / 2, -h / 2, w, h);
    return true;
  }

  // ikan hasil menyelam: spesies sungguhan dari zona permukaan yang muat dibawa burung
  function catchFor(bird) {
    const maxSize = bird.size * 2.2;
    const ids = ZONE_FISH[0].filter((id) => !SPECIES[id].protect && SPECIES[id].size[0] <= maxSize);
    if (!ids.length) return null;
    const id = pick(ids);
    const sp = SPECIES[id];
    return {
      type: id,
      sp,
      size: Math.min(rand(sp.size[0], sp.size[1]), maxSize),
      x: 0,
      y: 0,
      angle: 0,
      vx: 1,
      phase: Math.random() * TAU,
      inflate: 1,
      grabbed: true,
      spots: Array.from({ length: 7 }, () => [rand(-0.6, 0.6), rand(-0.7, 0.1)]),
    };
  }

  function wing(c, s, lift, color, near) {
    const tipX = -s * (near ? 0.18 : 0.24);
    const tipY = -lift * s * (near ? 0.9 : 0.75) - (near ? 0 : s * 0.04);
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(s * 0.16, -s * 0.04);
    c.quadraticCurveTo(s * 0.12, tipY * 0.65, tipX, tipY);
    c.quadraticCurveTo(-s * 0.04, tipY * 0.35, -s * 0.14, -s * 0.02);
    c.closePath();
    c.fill();
    // ujung sayap hitam
    c.strokeStyle = '#2b2d42';
    c.lineWidth = s * 0.07;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(tipX, tipY);
    c.lineTo(lerp(tipX, s * 0.1, 0.22), lerp(tipY, -s * 0.03, 0.22));
    c.stroke();
  }

  function splash(x, y, n) {
    for (let i = 0; i < n; i++) {
      drops.push({ x: x + rand(-6, 6), y, vx: rand(-2.4, 2.4), vy: rand(-6, -2.5), life: 1 });
    }
  }

  const maxBirds = () => (W < 600 ? 3 : 6);

  // burung yang dekat ikan terbang akan mengejar & menyambarnya
  function chaseFlyingFish(dt) {
    const r = canvas.getBoundingClientRect();
    for (const f of airFish) {
      if (f.stolen) continue;
      const fx = f.x - r.left;
      const fy = f.y - r.top;
      for (const b of birds) {
        if (b.state !== 'fly' || b.carryFish) continue;
        // burung tidak sanggup membawa ikan yang jauh lebih besar, dan tidak memangsa satwa dilindungi
        if (f.sp.protect || f.size > b.size * 2.2) continue;
        const d = Math.hypot(fx - b.x, fy - b.y);
        if (d > 250) continue;
        // kejar
        b.dir = fx >= b.x ? 1 : -1;
        b.x += (fx - b.x) * 0.06 * dt;
        b.y += (fy - b.y) * 0.06 * dt;
        b.flap += 0.35 * dt;
        b.glide = 0;
        if (d < b.size * 0.7 + f.size * 0.4) {
          f.stolen = true;
          b.carryFish = f;
          f.grabbed = true; // supaya ekornya bergerak meronta
          b.startle = 60;
          b.vy = -2.5;
          if (!toldSnatch) {
            toldSnatch = true;
            toast(`🐦 Hap! ${f.sp.name} disambar burung camar!`);
          }
          break;
        }
      }
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
    last = now;
    if (!visible) return;
    time += dt;

    spawnTimer -= dt;
    if (spawnTimer <= 0 && birds.length < maxBirds()) {
      birds.push(new Bird(false));
      spawnTimer = rand(80, 220);
    }
    for (const b of birds) b.update(dt);
    if (airFish.size) chaseFlyingFish(dt);
    for (const d of drops) {
      d.vy += 0.25 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.life -= 0.025 * dt;
    }
    for (let i = birds.length - 1; i >= 0; i--) if (birds[i].dead) birds.splice(i, 1);
    for (let i = drops.length - 1; i >= 0; i--) if (drops[i].life <= 0) drops.splice(i, 1);

    ctx.clearRect(0, 0, W, H);
    for (const b of birds) b.draw(ctx);
    ctx.fillStyle = 'rgba(225,245,255,.9)';
    for (const d of drops) {
      ctx.globalAlpha = Math.max(0, d.life);
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  function onMove(e) {
    if (!visible) return;
    [pointer.x, pointer.y] = toLocal(e);
    if (e.pointerType === 'mouse') {
      const over = !e.target.closest?.(BLOCK_SELECTOR) && birds.some((b) => b.hit(pointer.x, pointer.y));
      root.classList.toggle('can-poke', over);
    }
  }

  function onDown(e) {
    if (!visible || e.target.closest?.(BLOCK_SELECTOR)) return;
    const [x, y] = toLocal(e);
    const bird = birds.find((b) => b.hit(x, y));
    if (!bird) return;
    bird.dive();
    root.classList.remove('can-poke');
    if (!toldDive) {
      toldDive = true;
      toast('🐦 Burung camar menyelam mencari ikan!');
    }
  }

  function onLeave() {
    pointer.x = pointer.y = -999;
  }

  function resize() {
    // ukuran hero tidak berubah (mis. address bar HP) → jangan buat ulang kanvas
    if (W && W === hero.clientWidth && H === hero.clientHeight) return;
    DPR = canvasDPR();
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const sea = hero.querySelector('.sea');
    seaY = sea ? sea.offsetTop : H * 0.62;
  }

  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  io.observe(hero);

  resize();
  if (!reduce) for (let i = 0; i < Math.ceil(maxBirds() / 2); i++) birds.push(new Bird(true));
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown);
  document.addEventListener('pointerleave', onLeave);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerleave', onLeave);
    root.classList.remove('can-poke');
  };
}
