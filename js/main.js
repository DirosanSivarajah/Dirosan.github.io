import { createStars, drawStars } from './starfield.js';
import { createScenery, drawScenery } from './scenery.js';
import { createShip, updateShip, drawShip } from './ship.js';
import { createFlyingObjects, updateAndDrawFlyingObjects, checkSatelliteHit } from './flying-objects.js';
import { createHiddenStar, drawHiddenStar, checkHiddenStarHit, registerHiddenStarHit } from './hidden-star.js';
import { revealEnterButton, enterHub, exitHub, startLiveSyncTicker } from './hub.js';

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const enterWrap = document.getElementById('enterWrap');
const enterBtn = document.getElementById('enterBtn');
const backBtn = document.getElementById('backBtn');
const landing = document.getElementById('landing');
const hub = document.getElementById('hub');
const warpFlash = document.getElementById('warp-flash');
const coordA = document.getElementById('coord-a');
const coordB = document.getElementById('coord-b');
const liveClock = document.getElementById('liveClock');

const state = {
  W: 0,
  H: 0,
  DPR: 1,
  mouseX: 0,
  mouseY: 0,
  t: 0,
  reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

function resize() {
  state.DPR = Math.min(window.devicePixelRatio || 1, 2);
  state.W = canvas.clientWidth = window.innerWidth;
  state.H = canvas.clientHeight = window.innerHeight;
  canvas.width = state.W * state.DPR;
  canvas.height = state.H * state.DPR;
  ctx.setTransform(state.DPR, 0, 0, state.DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

state.mouseX = state.W / 2;
state.mouseY = state.H / 2;
window.addEventListener('mousemove', (e) => {
  state.mouseX = e.clientX;
  state.mouseY = e.clientY;
});

const stars = createStars(260, state.W, state.H);
const scenery = createScenery();
const ship = createShip(state.W, state.H);
const flyingObjects = createFlyingObjects(state.W, state.H);
const hiddenStar = createHiddenStar();

const ripples = [];

function drawRipples() {
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    rp.r += state.reduceMotion ? 0 : 2.6;
    rp.alpha -= 0.018;
    if (rp.alpha <= 0) {
      ripples.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rp.color},${rp.alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;

  if (checkHiddenStarHit(hiddenStar, cx, cy, state)) {
    const result = registerHiddenStarHit(hiddenStar);
    ripples.push({
      x: hiddenStar.xr * state.W,
      y: hiddenStar.yr * state.H,
      r: 6,
      alpha: 0.9,
      color: hiddenStar.color
    });
    if (result.justUnlocked) revealEnterButton(enterWrap);
    return;
  }

  const satelliteHit = checkSatelliteHit(flyingObjects, cx, cy);
  if (satelliteHit) {
    ripples.push({ x: satelliteHit.x, y: satelliteHit.y, r: 0, alpha: 0.6, color: '79,195,176' });
    return;
  }

  ripples.push({ x: cx, y: cy, r: 0, alpha: 0.5, color: '227,172,63' });
});

function loop() {
  state.t += state.reduceMotion ? 0 : 0.016;
  ctx.clearRect(0, 0, state.W, state.H);

  const g = ctx.createRadialGradient(
    state.W * 0.5,
    state.H * 0.4,
    0,
    state.W * 0.5,
    state.H * 0.4,
    Math.max(state.W, state.H) * 0.75
  );
  g.addColorStop(0, 'rgba(20,28,48,0.5)');
  g.addColorStop(1, 'rgba(10,14,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.W, state.H);

  drawScenery(ctx, scenery, state);
  drawStars(ctx, stars, state);
  updateAndDrawFlyingObjects(ctx, flyingObjects, state);
  drawRipples();
  drawHiddenStar(ctx, hiddenStar, state);
  updateShip(ship, state);
  drawShip(ctx, ship);

  requestAnimationFrame(loop);
}
loop();

enterBtn.addEventListener('click', () => enterHub(landing, hub, warpFlash));
backBtn.addEventListener('click', () => exitHub(landing, hub, warpFlash));

startLiveSyncTicker(liveClock);

setInterval(() => {
  const h = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const s = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  coordA.textContent = `RA ${h}h${m}m${s}s`;

  const deg = String(Math.floor(Math.random() * 90)).padStart(2, '0');
  const am = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const as = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  coordB.textContent = `DEC +${deg}°${am}'${as}"`;
}, 4000);
