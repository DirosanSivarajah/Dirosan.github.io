// Background star field: hundreds of twinkling points with subtle parallax.

export function createStars(count, W, H) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let shape = 'dot';
    if (roll > 0.93) shape = 'sparkle';
    else if (roll > 0.86) shape = 'diamond';

    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      depth: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      shape
    });
  }
  return stars;
}

function drawDot(ctx, x, y, r, alpha) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(236,239,251,${alpha})`;
  ctx.fill();
}

function drawDiamond(ctx, x, y, r, alpha) {
  const s = r * 1.8;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s * 0.6, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s * 0.6, y);
  ctx.closePath();
  ctx.fillStyle = `rgba(236,239,251,${alpha})`;
  ctx.fill();
}

function drawSparkle(ctx, x, y, r, alpha) {
  const s = r * 2.4;
  ctx.strokeStyle = `rgba(236,239,251,${alpha})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.moveTo(x, y - s);
  ctx.lineTo(x, y + s);
  ctx.stroke();
}

export function drawStars(ctx, stars, state) {
  const px = state.mouseX / state.W - 0.5;
  const py = state.mouseY / state.H - 0.5;

  stars.forEach((s) => {
    const twinkle = 0.55 + 0.45 * Math.sin(state.t * 2 + s.phase);
    const dx = state.reduceMotion ? 0 : px * s.depth * 22;
    const dy = state.reduceMotion ? 0 : py * s.depth * 22;
    const sx = s.x + dx;
    const sy = s.y + dy;

    const distToCursor = Math.hypot(sx - state.mouseX, sy - state.mouseY);
    const proximity = Math.max(0, 1 - distToCursor / 140);
    const boostedR = s.r + proximity * 2.2;
    const boostedAlpha = Math.min(1, twinkle * 0.85 + proximity * 0.6);

    if (s.shape === 'diamond') drawDiamond(ctx, sx, sy, boostedR, boostedAlpha);
    else if (s.shape === 'sparkle') drawSparkle(ctx, sx, sy, boostedR, boostedAlpha);
    else drawDot(ctx, sx, sy, boostedR, boostedAlpha);
  });
}
