// Ambient CPU/MEM/DISK gauges in the net-mon panel — atmospheric system
// noise, same spirit as the ping feed, not a claim about anything real.

const GAUGE_WIDTH = 10;

function renderGauge(barEl, pctEl, value) {
  const filled = Math.round((value / 100) * GAUGE_WIDTH);
  barEl.textContent = '[' + '█'.repeat(filled) + '░'.repeat(GAUGE_WIDTH - filled) + ']';
  pctEl.textContent = value + '%';
}

export function startGauges(reduceMotion) {
  let cpu = 42;
  let mem = 61;
  let disk = 34;

  function tick() {
    cpu = Math.max(8, Math.min(95, cpu + (Math.random() * 20 - 10)));
    mem = Math.max(20, Math.min(90, mem + (Math.random() * 10 - 5)));
    disk = Math.max(10, Math.min(80, disk + (Math.random() * 4 - 2)));
    renderGauge(document.getElementById('gaugeCpuBar'), document.getElementById('gaugeCpuPct'), Math.round(cpu));
    renderGauge(document.getElementById('gaugeMemBar'), document.getElementById('gaugeMemPct'), Math.round(mem));
    renderGauge(document.getElementById('gaugeDiskBar'), document.getElementById('gaugeDiskPct'), Math.round(disk));
  }

  tick();
  if (!reduceMotion) setInterval(tick, 1800);
}
