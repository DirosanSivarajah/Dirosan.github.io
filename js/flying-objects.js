// Everything that wanders the sky on its own: asteroids, the satellite, shooting
// stars, the comet, autonomous ships, and the floating astronaut.

function createAsteroidShape() {
  const sides = 6 + Math.floor(Math.random() * 3);
  const points = [];
  for (let i = 0; i < sides; i++) {
    points.push({ angle: (i / sides) * Math.PI * 2, radius: 0.7 + Math.random() * 0.5 });
  }
  return points;
}

function createAsteroidPool(count, W, H) {
  const asteroids = [];
  for (let i = 0; i < count; i++) {
    asteroids.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 4 + Math.random() * 5,
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.35),
      vy: (Math.random() - 0.5) * 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.012,
      shape: createAsteroidShape()
    });
  }
  return asteroids;
}

export function createFlyingObjects(W, H) {
  return {
    autoShips: [],
    satellite: null,
    shootingStars: [],
    comet: null,
    asteroids: createAsteroidPool(5, W, H),
    astronaut: null
  };
}

function updateAndDrawAsteroids(ctx, asteroids, state) {
  asteroids.forEach((a) => {
    a.x += state.reduceMotion ? 0 : a.vx;
    a.y += state.reduceMotion ? 0 : a.vy;
    a.rotation += state.reduceMotion ? 0 : a.rotationSpeed;

    if (a.x < -40 || a.x > state.W + 40 || a.y < -40 || a.y > state.H + 40) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      a.x = dir === 1 ? -30 : state.W + 30;
      a.y = Math.random() * state.H;
      a.vx = dir * (0.25 + Math.random() * 0.35);
      a.vy = (Math.random() - 0.5) * 0.2;
    }

    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation);
    ctx.beginPath();
    a.shape.forEach((pt, i) => {
      const x = Math.cos(pt.angle) * a.size * pt.radius;
      const y = Math.sin(pt.angle) * a.size * pt.radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(124,138,168,0.22)';
    ctx.strokeStyle = 'rgba(160,168,190,0.5)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

function maybeSpawnSatellite(objs, state) {
  if (state.reduceMotion || objs.satellite) return;
  if (Math.random() < 0.0012) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    objs.satellite = {
      x: dir === 1 ? -20 : state.W + 20,
      y: Math.random() * state.H * 0.4 + state.H * 0.08,
      vx: dir * (0.3 + Math.random() * 0.15),
      blink: 0,
      trail: []
    };
  }
}

function updateAndDrawSatellite(ctx, objs, state) {
  maybeSpawnSatellite(objs, state);
  const s = objs.satellite;
  if (!s) return;

  s.x += state.reduceMotion ? 0 : s.vx * 2;
  s.blink += 0.05;
  s.trail.push({ x: s.x, y: s.y });
  if (s.trail.length > 26) s.trail.shift();

  ctx.beginPath();
  s.trail.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.strokeStyle = 'rgba(79,195,176,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const blinkAlpha = 0.4 + 0.6 * Math.max(0, Math.sin(s.blink));
  ctx.beginPath();
  ctx.arc(s.x, s.y, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(79,195,176,${blinkAlpha})`;
  ctx.fill();

  if (s.x < -30 || s.x > state.W + 30) objs.satellite = null;
}

export function checkSatelliteHit(objs, x, y) {
  const s = objs.satellite;
  if (!s) return null;
  if (Math.hypot(x - s.x, y - s.y) < 16) return { x: s.x, y: s.y };
  return null;
}

function maybeSpawnShootingStar(objs, state) {
  if (state.reduceMotion) return;
  if (Math.random() < 0.008 && objs.shootingStars.length < 3) {
    const startX = Math.random() * state.W * 0.6 + state.W * 0.2;
    objs.shootingStars.push({
      x: startX,
      y: -10,
      vx: (Math.random() * 1.2 + 1.6) * (Math.random() < 0.5 ? -1 : 1),
      vy: Math.random() * 2 + 2.4,
      life: 1
    });
  }
}

function updateAndDrawShootingStars(ctx, objs, state) {
  maybeSpawnShootingStar(objs, state);
  for (let i = objs.shootingStars.length - 1; i >= 0; i--) {
    const sh = objs.shootingStars[i];
    sh.x += state.reduceMotion ? 0 : sh.vx * 3;
    sh.y += state.reduceMotion ? 0 : sh.vy * 3;
    sh.life -= 0.014;
    if (sh.life <= 0 || sh.y > state.H + 20) {
      objs.shootingStars.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(sh.x, sh.y);
    ctx.lineTo(sh.x - sh.vx * 12, sh.y - sh.vy * 12);
    ctx.strokeStyle = `rgba(236,239,251,${sh.life * 0.8})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
}

function maybeSpawnComet(objs, state) {
  if (state.reduceMotion || objs.comet) return;
  if (Math.random() < 0.0006) {
    const startX = Math.random() * state.W * 0.5 + state.W * 0.15;
    objs.comet = {
      x: startX,
      y: -30,
      vx: (Math.random() * 0.6 + 0.7) * (Math.random() < 0.5 ? -1 : 1),
      vy: Math.random() * 0.9 + 0.9,
      life: 1
    };
  }
}

function updateAndDrawComet(ctx, objs, state) {
  maybeSpawnComet(objs, state);
  const c = objs.comet;
  if (!c) return;

  c.x += state.reduceMotion ? 0 : c.vx * 2.4;
  c.y += state.reduceMotion ? 0 : c.vy * 2.4;
  c.life -= 0.006;

  const tailX = c.x - c.vx * 40;
  const tailY = c.y - c.vy * 40;
  const grad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
  grad.addColorStop(0, `rgba(236,239,251,${c.life})`);
  grad.addColorStop(1, 'rgba(236,239,251,0)');

  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(tailX, tailY);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
  ctx.shadowColor = 'rgba(236,239,251,0.9)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = `rgba(236,239,251,${c.life})`;
  ctx.fill();
  ctx.shadowBlur = 0;

  if (c.life <= 0 || c.y > state.H + 40) objs.comet = null;
}

function maybeSpawnAutoShip(objs, state) {
  if (state.reduceMotion || objs.autoShips.length >= 2) return;
  if (Math.random() < 0.0015) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    objs.autoShips.push({
      x: dir === 1 ? -20 : state.W + 20,
      y: Math.random() * state.H * 0.7 + state.H * 0.1,
      vx: dir * (0.4 + Math.random() * 0.3),
      angle: dir === 1 ? 0 : Math.PI,
      blink: Math.random() * Math.PI * 2
    });
  }
}

function updateAndDrawAutoShips(ctx, objs, state) {
  maybeSpawnAutoShip(objs, state);
  for (let i = objs.autoShips.length - 1; i >= 0; i--) {
    const s = objs.autoShips[i];
    s.x += state.reduceMotion ? 0 : s.vx * 2;
    s.blink += 0.06;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(-5, 4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, -4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(138,124,240,0.55)';
    ctx.fill();
    const blinkAlpha = 0.3 + 0.5 * Math.max(0, Math.sin(s.blink));
    ctx.beginPath();
    ctx.arc(-5, 0, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(138,124,240,${blinkAlpha})`;
    ctx.fill();
    ctx.restore();

    if (s.x < -30 || s.x > state.W + 30) objs.autoShips.splice(i, 1);
  }
}

function maybeSpawnAstronaut(objs, state) {
  if (state.reduceMotion || objs.astronaut) return;
  if (Math.random() < 0.0004) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    objs.astronaut = {
      x: dir === 1 ? -20 : state.W + 20,
      y: Math.random() * state.H * 0.6 + state.H * 0.15,
      vx: dir * (0.12 + Math.random() * 0.08),
      vy: (Math.random() - 0.5) * 0.05,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.01
    };
  }
}

function updateAndDrawAstronaut(ctx, objs, state) {
  maybeSpawnAstronaut(objs, state);
  const a = objs.astronaut;
  if (!a) return;

  a.x += state.reduceMotion ? 0 : a.vx * 2;
  a.y += state.reduceMotion ? 0 : a.vy * 2;
  a.rotation += state.reduceMotion ? 0 : a.rotationSpeed;

  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rotation);
  ctx.strokeStyle = 'rgba(236,239,251,0.4)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(0, -7, 3.4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -3.6);
  ctx.lineTo(0, 5);
  ctx.moveTo(0, -1);
  ctx.lineTo(-6, 2);
  ctx.moveTo(0, -1);
  ctx.lineTo(6, 2);
  ctx.moveTo(0, 5);
  ctx.lineTo(-4, 11);
  ctx.moveTo(0, 5);
  ctx.lineTo(4, 11);
  ctx.stroke();

  ctx.restore();

  if (a.x < -30 || a.x > state.W + 30) objs.astronaut = null;
}

export function updateAndDrawFlyingObjects(ctx, objs, state) {
  updateAndDrawAsteroids(ctx, objs.asteroids, state);
  updateAndDrawSatellite(ctx, objs, state);
  updateAndDrawShootingStars(ctx, objs, state);
  updateAndDrawComet(ctx, objs, state);
  updateAndDrawAutoShips(ctx, objs, state);
  updateAndDrawAstronaut(ctx, objs, state);
}
