// Background scenery drawn behind the stars: nebula clouds, a spiral galaxy, and planets.

const NEBULA_COLORS = ['138,124,240', '79,195,176', '224,110,110'];

export function createScenery() {
  const nebulas = [];
  const nebulaCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < nebulaCount; i++) {
    nebulas.push({
      xr: Math.random() * 0.8 + 0.1,
      yr: Math.random() * 0.8 + 0.1,
      r: 140 + Math.random() * 120,
      color: NEBULA_COLORS[i % NEBULA_COLORS.length],
      depth: 0.015 + Math.random() * 0.02
    });
  }

  const galaxy = {
    xr: 0.07,
    yr: 0.88,
    radius: 42,
    rotation: 0,
    dots: []
  };
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      galaxy.dots.push({
        angle: t * Math.PI * 2.4 + arm * Math.PI,
        radius: t * galaxy.radius,
        size: 0.5 + Math.random() * 0.8
      });
    }
  }

  const planets = [
    { xr: 0.09, yr: 0.78, r: 46, color: '138,124,240', ring: false, depth: 0.035 },
    { xr: 0.95, yr: 0.6, r: 26, color: '108,180,224', ring: true, depth: 0.025 }
  ];

  return { nebulas, galaxy, planets };
}

function drawNebulas(ctx, nebulas, state) {
  const px = state.mouseX / state.W - 0.5;
  const py = state.mouseY / state.H - 0.5;

  nebulas.forEach((n) => {
    const dx = state.reduceMotion ? 0 : px * n.depth * 40;
    const dy = state.reduceMotion ? 0 : py * n.depth * 40;
    const cx = n.xr * state.W + dx;
    const cy = n.yr * state.H + dy;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, n.r);
    grad.addColorStop(0, `rgba(${n.color},0.09)`);
    grad.addColorStop(1, `rgba(${n.color},0)`);

    ctx.beginPath();
    ctx.arc(cx, cy, n.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  });
}

function drawGalaxy(ctx, galaxy, state) {
  galaxy.rotation += state.reduceMotion ? 0 : 0.0009;
  const cx = galaxy.xr * state.W;
  const cy = galaxy.yr * state.H;

  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(236,239,251,0.5)';
  ctx.fill();

  galaxy.dots.forEach((d) => {
    const angle = d.angle + galaxy.rotation;
    const x = cx + Math.cos(angle) * d.radius;
    const y = cy + Math.sin(angle) * d.radius * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, d.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,210,235,0.25)';
    ctx.fill();
  });
}

function drawPlanets(ctx, planets, state) {
  const px = state.mouseX / state.W - 0.5;
  const py = state.mouseY / state.H - 0.5;

  planets.forEach((p) => {
    const dx = state.reduceMotion ? 0 : px * p.depth * 22;
    const dy = state.reduceMotion ? 0 : py * p.depth * 22;
    const cx = p.xr * state.W + dx;
    const cy = p.yr * state.H + dy;

    const grad = ctx.createRadialGradient(cx - p.r * 0.3, cy - p.r * 0.3, p.r * 0.1, cx, cy, p.r);
    grad.addColorStop(0, `rgba(${p.color},0.25)`);
    grad.addColorStop(1, `rgba(${p.color},0.03)`);

    ctx.beginPath();
    ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    if (p.ring) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p.color},0.18)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  });
}

export function drawScenery(ctx, scenery, state) {
  drawNebulas(ctx, scenery.nebulas, state);
  drawGalaxy(ctx, scenery.galaxy, state);
  drawPlanets(ctx, scenery.planets, state);
}
