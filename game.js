'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

function complementColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = (h + 0.5) % 1;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const cr = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const cg = Math.round(hue2rgb(p, q, h) * 255);
  const cb = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  return `rgba(${cr},${cg},${cb},0.85)`;
}

// ── Skins ────────────────────────────────────────────────────────────────────
const SKINS = [
  {
    name: 'CLASICA',
    color: '#ffffff',
    verts: [[20,0],[-12,-9],[-7,0],[-12,9]],
    nose: 21,
    flameType: 'classic',
    flameX: -8,
  },
  {
    name: 'MANTA',
    color: '#00ffcc',
    verts: [[18,0],[8,-14],[-6,-10],[-14,-3],[-14,3],[-6,10],[8,14]],
    nose: 18,
    flameType: 'dual',
    flameX: -14,
  },
  {
    name: 'CRESCENT',
    color: '#ff00ff',
    verts: [[16,0],[4,-14],[-10,-10],[-14,0],[-10,10],[4,14]],
    nose: 16,
    flameType: 'trail',
    flameX: -14,
  },
  {
    name: 'DRAGONFLY',
    color: '#8888ff',
    verts: [[22,0],[6,-5],[2,-3],[2,-12],[-8,-4],[-4,0],[-8,4],[2,12],[2,3],[6,5]],
    nose: 22,
    flameType: 'trail',
    flameX: -8,
  },
  {
    name: 'ORIGAMI',
    color: '#00ff41',
    verts: [[22,0],[8,-8],[0,-4],[0,4],[8,8]],
    nose: 22,
    flameType: 'classic',
    flameX: -2,
  },
  {
    name: 'HAMMER',
    color: '#ff4444',
    verts: [[16,0],[14,-10],[4,-8],[-4,-4],[-8,0],[-4,4],[4,8],[14,10]],
    nose: 16,
    flameType: 'dual',
    flameX: -8,
  },
  {
    name: 'ORO',
    color: '#ffd700',
    verts: [[40,0],[-24,-18],[-14,0],[-24,18]],
    nose: 42,
    radius: 24,
    points: 2,
    previewScale: 0.75,
    flameType: 'classic',
    flameX: -16,
  },
];

const SKIN_FLAMES = {};
for (const s of SKINS) SKIN_FLAMES[s.name] = complementColor(s.color);

let currentSkinIndex = 0;

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle, opts = {}) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = opts.radius || 2;
    this.color = opts.color || '#fff';
    this.length = opts.length || 0;
    this.angle = angle;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
    ctx.lineWidth = this.radius * 2;
    ctx.lineCap = 'round';
    if (this.length > 0) {
      const dx = Math.cos(this.angle) * this.length;
      const dy = Math.sin(this.angle) * this.length;
      ctx.beginPath();
      ctx.moveTo(this.x - dx, this.y - dy);
      ctx.lineTo(this.x + dx, this.y + dy);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── PinkStar (asteroide especial) ─────────────────────────────────────────────
class PinkStar extends Asteroid {
  constructor(x, y) {
    super(x, y, 2);
    this.radius = 20;
    this.ttl = rand(4, 6);
    this.life = this.ttl;
    this.dead = false;
    this.isPinkStar = true;

    const angle = rand(0, Math.PI * 2);
    const speed = 110 + rand(-20, 20);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-0.8, 0.8);
    this.rot = rand(0, Math.PI * 2);

    this.numSpikes = 8;
    this.spikeInner = this.radius * 0.55;
    this.spikeOuter = this.radius;
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() { return []; }

  draw() {
    const alpha = Math.min(1, this.ttl / 2);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);

    // Estela naranja
    ctx.strokeStyle = `rgba(255,120,0,${(alpha * 0.5).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = rand(0, Math.PI * 2);
      const len = rand(15, 30);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
      ctx.stroke();
    }

    // Sol magenta con puntas suavizadas
    ctx.fillStyle = `rgba(255,0,255,${(alpha * 0.8).toFixed(2)})`;
    ctx.strokeStyle = `rgba(255,0,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const n = this.numSpikes;
    for (let i = 0; i < n; i++) {
      const aOuter = (i / n) * Math.PI * 2;
      const aInner = ((i + 0.5) / n) * Math.PI * 2;
      const ox = Math.cos(aOuter) * this.spikeOuter;
      const oy = Math.sin(aOuter) * this.spikeOuter;
      const ix = Math.cos(aInner) * this.spikeInner;
      const iy = Math.sin(aInner) * this.spikeInner;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.quadraticCurveTo(ix * 1.15, iy * 1.15,
        Math.cos(((i + 1) / n) * Math.PI * 2) * this.spikeOuter,
        Math.sin(((i + 1) / n) * Math.PI * 2) * this.spikeOuter);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    const skin  = SKINS[currentSkinIndex];
    this.radius = skin.radius || 12;
    this.nose   = skin.nose;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;
    this.tripleShotTimer = 0;
    this.shieldTimer   = 0;
    this.dead          = false;
  }

  applySpeed() {
    this.speedTimer = 5;
  }

  applyTripleShot() {
    this.tripleShotTimer = 5;
  }

  applyShield() {
    this.shieldTimer = 6;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.tripleShotTimer > 0) this.tripleShotTimer -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;

    const ROT   = 3.5;   // rad/s
    let THRUST = 260;  // px/s²
    if (this.speedTimer > 0) THRUST *= 2;
    const DRAG   = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const ox = this.x + Math.cos(this.angle) * this.nose;
    const oy = this.y + Math.sin(this.angle) * this.nose;
    if (this.tripleShotTimer > 0) {
      const SPREAD = 10;
      const px = -Math.sin(this.angle) * SPREAD;
      const py =  Math.cos(this.angle) * SPREAD;
      const opts = { color: '#ff3333', radius: 2.5, length: 8 };
      return [
        new Bullet(ox + px, oy + py, this.angle, opts),
        new Bullet(ox, oy, this.angle, opts),
        new Bullet(ox - px, oy - py, this.angle, opts),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    const skin = SKINS[currentSkinIndex];
    const flame = SKIN_FLAMES[skin.name];
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = skin.color;
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';

    ctx.beginPath();
    ctx.moveTo(skin.verts[0][0], skin.verts[0][1]);
    for (let i = 1; i < skin.verts.length; i++)
      ctx.lineTo(skin.verts[i][0], skin.verts[i][1]);
    ctx.closePath();
    ctx.stroke();

    if (this.thrusting && Math.random() > 0.3) {
      ctx.strokeStyle = flame;
      ctx.lineWidth = 1.5;
      const fx = skin.flameX;
      switch (skin.flameType) {
        case 'classic': {
          const len = rand(6, 14);
          ctx.beginPath();
          ctx.moveTo(fx, -4);
          ctx.lineTo(fx - len, 0);
          ctx.lineTo(fx, 4);
          ctx.stroke();
          break;
        }
        case 'dual': {
          const len = rand(5, 10);
          ctx.beginPath();
          ctx.moveTo(fx, -5);
          ctx.lineTo(fx - len, -5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(fx, 5);
          ctx.lineTo(fx - len, 5);
          ctx.stroke();
          break;
        }
        case 'cone': {
          const len = rand(8, 16);
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx, -6);
          ctx.lineTo(fx - len, 0);
          ctx.lineTo(fx, 6);
          ctx.closePath();
          ctx.stroke();
          ctx.globalAlpha = 1;
          break;
        }
        case 'trail': {
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            const a = rand(-0.3, 0.3);
            const len = rand(8, 18);
            ctx.beginPath();
            ctx.moveTo(fx, 0);
            ctx.lineTo(fx - Math.cos(a) * len, Math.sin(a) * len);
            ctx.stroke();
          }
          break;
        }
      }
    }

    // Escudo protector
    if (this.shieldTimer > 0) {
      const pulse = 0.3 + 0.15 * Math.sin(this.shieldTimer * 6);
      ctx.strokeStyle = `rgba(0,180,255,${pulse.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(0,180,255,${(pulse * 0.35).toFixed(2)})`;
      ctx.fill();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── FireworkParticle (explosión fuego artificial) ────────────────────────────
class FireworkParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(40, 180);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = rand(0.6, 1.4);
    this.ttl = this.life;
    this.radius = rand(1.5, 3.5);
    this.dead = false;

    const colors = [
      [255, 0, 255],
      [255, 100, 200],
      [255, 150, 50],
      [255, 255, 255],
    ];
    this.color = colors[randInt(0, colors.length - 1)];
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    const [r, g, b] = this.color;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Power-Up ─────────────────────────────────────────────────────────────────
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || (Math.random() < 0.65 ? 'speed' : 'tripleShot');
    this.radius = 10;
    this.ttl = 8;
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = rand(20, 50);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = Math.min(1, this.ttl / 2);
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'shield') {
      ctx.strokeStyle = `rgba(0,180,255,${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const n = 6;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * 7;
        const py = Math.sin(a) * 7;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = `rgba(0,180,255,${(alpha * 0.3).toFixed(2)})`;
      ctx.fill();
    } else if (this.type === 'tripleShot') {
      const color = '255,50,50';
      ctx.strokeStyle = `rgba(${color},${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.fillStyle = `rgba(${color},${(alpha * 0.8).toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2, -6);
      ctx.lineTo(0, -9);
      ctx.lineTo(2, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeStyle = `rgba(255,220,0,${alpha.toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -7);
      ctx.lineTo(1, -1);
      ctx.lineTo(-1, -1);
      ctx.lineTo(3, 7);
      ctx.lineTo(-1, 1);
      ctx.lineTo(1, 1);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = `rgba(255,220,0,${(alpha * 0.3).toFixed(2)})`;
      ctx.fill();
    }
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerUps;
let score, lives, level;
let state;      // 'menu' | 'playing' | 'dead' | 'gameover'
let deadTimer;
let powerUpTimer;
let shieldPowerUpTimer;
let pinkStarTimer;
let pinkStarsSpawned;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerUps  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  powerUpTimer = rand(8, 15);
  shieldPowerUpTimer = rand(15, 25);
  pinkStarTimer = rand(3, 7);
  pinkStarsSpawned = 0;
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerUps  = [];
  ship.reset();
  powerUpTimer = rand(8, 15);
  shieldPowerUpTimer = rand(15, 25);
  pinkStarTimer = rand(3, 7);
  pinkStarsSpawned = 0;
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function fireworkExplode(x, y, count = 25) {
  for (let i = 0; i < count; i++) particles.push(new FireworkParticle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'menu') {
    if (pressed('ArrowLeft'))  currentSkinIndex = (currentSkinIndex - 1 + SKINS.length) % SKINS.length;
    if (pressed('ArrowRight')) currentSkinIndex = (currentSkinIndex + 1) % SKINS.length;
    if (pressed('Enter') || pressed('Space')) {
      initGame();
    }
    return;
  }

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  if (pressed('KeyW')) {
    currentSkinIndex = (currentSkinIndex + 1) % SKINS.length;
    const skin = SKINS[currentSkinIndex];
    ship.nose   = skin.nose;
    ship.radius = skin.radius || 12;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));

  // Spawning periódico de power-ups
  powerUpTimer -= dt;
  if (powerUpTimer <= 0) {
    powerUps.push(new PowerUp(rand(0, W), rand(0, H)));
    powerUpTimer = rand(7, 14);
  }

  // Spawning periódico de shield power-ups
  shieldPowerUpTimer -= dt;
  if (shieldPowerUpTimer <= 0) {
    powerUps.push(new PowerUp(rand(0, W), rand(0, H), 'shield'));
    shieldPowerUpTimer = rand(15, 25);
  }

  powerUps.forEach(p => p.update(dt));

  // Spawning periódico de pinkStars
  pinkStarTimer -= dt;
  if (pinkStarTimer <= 0 && pinkStarsSpawned < 2) {
    const side = randInt(0, 3);
    let x, y;
    if (side === 0)      { x = 0; y = rand(0, H); }
    else if (side === 1) { x = W; y = rand(0, H); }
    else if (side === 2) { x = rand(0, W); y = 0; }
    else                 { x = rand(0, W); y = H; }
    asteroids.push(new PinkStar(x, y));
    pinkStarsSpawned++;
    pinkStarTimer = rand(12, 20);
  }

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerUps  = powerUps.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  const mult = SKINS[currentSkinIndex].points || 1;
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += (a.isPinkStar ? 200 : POINTS[a.size]) * mult;
        if (a.isPinkStar) fireworkExplode(a.x, a.y, 25);
        else explode(a.x, a.y, a.size * 5);
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shieldTimer > 0) {
          a.dead = true;
          score += (a.isPinkStar ? 200 : POINTS[a.size]) * mult;
          if (a.isPinkStar) fireworkExplode(a.x, a.y, 25);
          else explode(a.x, a.y, a.size * 5);
          asteroids.push(...a.split());
        } else {
          killShip();
          break;
        }
      }
    }
    asteroids = asteroids.filter(a => !a.dead);
  }

  // Nave vs power-up
  for (const p of powerUps) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      if (p.type === 'tripleShot') ship.applyTripleShot();
      else if (p.type === 'shield') ship.applyShield();
      else ship.applySpeed();
      explode(p.x, p.y, 6);
      p.dead = true;
    }
  }
  powerUps = powerUps.filter(p => !p.dead);

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const skin = SKINS[currentSkinIndex];
  const S = 0.45 * (skin.previewScale || 1);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = skin.color;
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.verts[0][0] * S, skin.verts[0][1] * S);
  for (let i = 1; i < skin.verts.length; i++)
    ctx.lineTo(skin.verts[i][0] * S, skin.verts[i][1] * S);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  if (ship.speedTimer > 0) {
    ctx.fillStyle = '#ffdc00';
    ctx.fillText(`SPEED  ${ship.speedTimer.toFixed(1)}s`, 14, 46);
    ctx.fillStyle = '#fff';
  }

  if (ship.tripleShotTimer > 0) {
    ctx.fillStyle = '#ff3333';
    const yOff = ship.speedTimer > 0 ? 62 : 46;
    ctx.fillText(`TRIPLE SHOT  ${ship.tripleShotTimer.toFixed(1)}s`, 14, yOff);
    ctx.fillStyle = '#fff';
  }

  if (ship.shieldTimer > 0) {
    ctx.fillStyle = '#00b4ff';
    let yOff = 46;
    if (ship.speedTimer > 0) yOff += 16;
    if (ship.tripleShotTimer > 0) yOff += 16;
    ctx.fillText(`SHIELD  ${ship.shieldTimer.toFixed(1)}s`, 14, yOff);
    ctx.fillStyle = '#fff';
  }

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function drawMenuSkinPreview(x, y, skinIndex, scale, highlighted) {
  const skin = SKINS[skinIndex];
  const verts = skin.verts;
  const flame = SKIN_FLAMES[skin.name];
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = skin.color;
  ctx.lineWidth = highlighted ? 2.5 : 1.5;
  ctx.lineJoin = 'round';
  if (!highlighted) ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(verts[0][0] * scale, verts[0][1] * scale);
  for (let i = 1; i < verts.length; i++)
    ctx.lineTo(verts[i][0] * scale, verts[i][1] * scale);
  ctx.closePath();
  ctx.stroke();

  if (highlighted) {
    ctx.strokeStyle = flame;
    ctx.lineWidth = 1.5;
    const s = scale;
    const fx = skin.flameX * s;
    switch (skin.flameType) {
      case 'classic':
        ctx.beginPath();
        ctx.moveTo(fx, -4 * s);
        ctx.lineTo(fx - 6 * s, 0);
        ctx.lineTo(fx, 4 * s);
        ctx.stroke();
        break;
      case 'dual':
        ctx.beginPath();
        ctx.moveTo(fx, -5 * s);
        ctx.lineTo(fx - 6 * s, -5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx, 5 * s);
        ctx.lineTo(fx - 6 * s, 5 * s);
        ctx.stroke();
        break;
      case 'cone':
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx, -6 * s);
        ctx.lineTo(fx - 8 * s, 0);
        ctx.lineTo(fx, 6 * s);
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
      case 'trail':
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const a = (i - 1) * 0.25;
          ctx.beginPath();
          ctx.moveTo(fx, 0);
          ctx.lineTo(fx - Math.cos(a) * 10 * s, Math.sin(a) * 10 * s);
          ctx.stroke();
        }
        break;
    }
  }

  ctx.restore();
}

function drawMenu() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 46px monospace';
  ctx.fillText('ASTEROIDS', W / 2, 80);

  ctx.font = '16px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('SELECCIONA TU NAVE', W / 2, 120);

  const spacing = 100;
  const startX = W / 2 - ((SKINS.length - 1) / 2) * spacing;
  const y = H / 2 - 30;

  for (let i = 0; i < SKINS.length; i++) {
    const x = startX + i * spacing;
    const highlighted = i === currentSkinIndex;

    if (highlighted) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x - 45, y - 45, 90, 90);
    }

    drawMenuSkinPreview(x, y, i, (highlighted ? 1.8 : 1.2) * (SKINS[i].previewScale || 1), highlighted);
  }

  const skin = SKINS[currentSkinIndex];
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = skin.color;
  ctx.fillText(skin.name, W / 2, H / 2 + 55);

  if (skin.points > 1) {
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255,215,0,0.9)';
    ctx.fillText('PUNTOS X2', W / 2, H / 2 + 78);
  }

  ctx.font = '15px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('\u2190 \u2192  SELECCIONAR     ENTER  JUGAR', W / 2, H - 60);

  ctx.font = '13px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('EN JUEGO: W PARA CAMBIAR SKIN', W / 2, H - 35);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  if (state === 'menu') {
    drawMenu();
    return;
  }

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerUps.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

state = 'menu';
requestAnimationFrame(loop);
