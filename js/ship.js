// The small ship that trails the mouse cursor with eased lag and a spark trail.

export function createShip(W, H) {
  return { x: W / 2, y: H / 2, angle: 0, sparks: [] };
}

export function updateShip(ship, state) {
  if (state.reduceMotion) {
    ship.x = state.mouseX;
    ship.y = state.mouseY;
    return;
  }

  const prevX = ship.x;
  const prevY = ship.y;
  ship.x += (state.mouseX - ship.x) * 0.08;
  ship.y += (state.mouseY - ship.y) * 0.08;

  const dx = ship.x - prevX;
  const dy = ship.y - prevY;
  if (Math.hypot(dx, dy) > 0.15) ship.angle = Math.atan2(dy, dx);

  if (Math.hypot(dx, dy) > 0.3 && Math.random() < 0.6) {
    ship.sparks.push({
      x: ship.x - Math.cos(ship.angle) * 8,
      y: ship.y - Math.sin(ship.angle) * 8,
      life: 1
    });
  }
}

export function drawShip(ctx, ship) {
  for (let i = ship.sparks.length - 1; i >= 0; i--) {
    const sp = ship.sparks[i];
    sp.life -= 0.03;
    if (sp.life <= 0) {
      ship.sparks.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 1.4 * sp.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(227,172,63,${sp.life * 0.7})`;
    ctx.fill();
  }

  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.shadowColor = 'rgba(236,239,251,0.6)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(9, 0);
  ctx.lineTo(-6, 5);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-6, -5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(236,239,251,0.9)';
  ctx.fill();
  ctx.restore();
}
