// Boot log reveal and the tty clock.

export function revealBootLines(reduceMotion) {
  const lines = document.querySelectorAll('.boot-line');
  lines.forEach((el, i) => {
    if (reduceMotion) el.classList.add('show');
    else setTimeout(() => el.classList.add('show'), 200 * i);
  });
}

export function startClock(el) {
  function tick() {
    el.textContent = new Date().toTimeString().slice(0, 8);
  }
  tick();
  setInterval(tick, 1000);
}
