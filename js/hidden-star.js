// The hidden trigger: a fixed-position star with a randomized shape and color
// each visit. Three hits within its hit radius unlock the archive.

const SHAPES = ['sparkle', 'fiveStar', 'cross', 'ring', 'hexagon'];
const COLORS = [
  '227,172,63', // amber
  '79,195,176', // teal
  '138,124,240', // violet
  '224,110,110', // rose
  '108,180,224' // ice blue
];

const HIT_RADIUS = 46;
const HITS_NEEDED = 3;

export function createHiddenStar() {
  return {
    xr: 0.815,
    yr: 0.24,
    baseRadius: 16,
    rotation: 0,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    hits: 0,
    unlocked: false
  };
}

function pathSparkle(ctx, r) {
  const spikes = 4;
  const inner = r * 0.35;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / spikes) * i;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function pathFiveStar(ctx, r) {
  const spikes = 5;
  const inner = r * 0.45;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : inner;
    const angle = (Math.PI / spikes) * i - Math.PI / 2;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function pathCross(ctx, r) {
  const arm = r * 0.38;
  ctx.beginPath();
  ctx.moveTo(-arm, -r);
  ctx.lineTo(arm, -r);
  ctx.lineTo(arm, -arm);
  ctx.lineTo(r, -arm);
  ctx.lineTo(r, arm);
  ctx.lineTo(arm, arm);
  ctx.lineTo(arm, r);
  ctx.lineTo(-arm, r);
  ctx.lineTo(-arm, arm);
  ctx.lineTo(-r, arm);
  ctx.lineTo(-r, -arm);
  ctx.lineTo(-arm, -arm);
  ctx.closePath();
}

function pathHexagon(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawHiddenStar(ctx, star, state) {
  const hx = star.xr * state.W;
  const hy = star.yr * state.H;
  const pulse = 0.6 + 0.4 * Math.sin(state.t * 1.4);
  const radius = star.baseRadius + pulse * 5;
  const glow = 22 + pulse * 14;
  const rgb = star.color;

  star.rotation += state.reduceMotion ? 0 : 0.006;

  // DEV MARKER — remove once the build is finalized, just here for quick navigation while testing
  ctx.beginPath();
  ctx.arc(hx, hy, radius + 34, 0, Math.PI * 2);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 3;
  ctx.stroke();

  // persistent ring, always visible, marks the spot even before the shape reads
  ctx.beginPath();
  ctx.arc(hx, hy, radius + 16, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${rgb},${0.3 + pulse * 0.2})`;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(star.rotation);
  ctx.shadowColor = `rgba(${rgb},0.9)`;
  ctx.shadowBlur = glow;
  ctx.fillStyle = `rgba(${rgb},0.95)`;
  ctx.strokeStyle = `rgba(${rgb},0.9)`;
  ctx.lineWidth = 3;

  if (star.shape === 'ring') {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    if (star.shape === 'sparkle') pathSparkle(ctx, radius);
    else if (star.shape === 'fiveStar') pathFiveStar(ctx, radius);
    else if (star.shape === 'cross') pathCross(ctx, radius);
    else pathHexagon(ctx, radius);
    ctx.fill();
  }

  ctx.restore();

  if (star.unlocked) {
    ctx.beginPath();
    ctx.arc(hx, hy, radius + 26 + pulse * 3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},0.5)`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

export function checkHiddenStarHit(star, x, y, state) {
  const hx = star.xr * state.W;
  const hy = star.yr * state.H;
  return Math.hypot(x - hx, y - hy) < HIT_RADIUS;
}

export function registerHiddenStarHit(star) {
  if (star.unlocked) return { justUnlocked: false, hits: star.hits };
  star.hits++;
  const justUnlocked = star.hits >= HITS_NEEDED;
  if (justUnlocked) star.unlocked = true;
  return { justUnlocked, hits: star.hits };
}
