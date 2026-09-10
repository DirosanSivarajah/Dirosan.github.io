// Real, live measurements of this browser tab — not a claim about your
// whole system (a static site with no backend can't see that). Rendered
// as a scrolling block-height history, like a real terminal system
// monitor (btop/htop).
//
//   heap — JS heap used, as a % of this tab's heap limit (Chromium only;
//          shown as "n/a" elsewhere, never faked)
//   fps  — live frames rendered per second, via requestAnimationFrame
//   lag  — main-thread responsiveness: how late a scheduled timer actually
//          fires, in milliseconds

const HISTORY_LEN = 26;

function tierClass(value) {
  if (value < 45) return 'blk-low';
  if (value < 75) return 'blk-mid';
  return 'blk-high';
}

function renderHistory(el, history) {
  el.innerHTML = history.map((v) =>
    `<span class="gauge-col ${tierClass(v)}" style="height:${Math.max(8, v)}%"></span>`
  ).join('');
}

function makeHistory() {
  return Array(HISTORY_LEN).fill(0);
}

function pushValue(history, value) {
  history.push(value);
  if (history.length > HISTORY_LEN) history.shift();
}

export function startGauges(reduceMotion) {
  const heapBar = document.getElementById('gaugeHeapBar');
  const heapPct = document.getElementById('gaugeHeapPct');
  const fpsBar = document.getElementById('gaugeFpsBar');
  const fpsPct = document.getElementById('gaugeFpsPct');
  const lagBar = document.getElementById('gaugeLagBar');
  const lagPct = document.getElementById('gaugeLagPct');

  const heapHistory = makeHistory();
  const fpsHistory = makeHistory();
  const lagHistory = makeHistory();

  const hasHeapInfo = !!(performance && performance.memory);
  if (!hasHeapInfo) {
    heapBar.innerHTML = '';
    heapPct.textContent = 'n/a';
  }

  if (reduceMotion) {
    if (hasHeapInfo) {
      const pct = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
      pushValue(heapHistory, pct);
      renderHistory(heapBar, heapHistory);
      heapPct.textContent = pct + '%';
    }
    fpsPct.textContent = '—';
    lagPct.textContent = '—';
    return;
  }

  // --- fps: count real frames per second via requestAnimationFrame ---
  let frameCount = 0;
  function countFrame() {
    frameCount++;
    requestAnimationFrame(countFrame);
  }
  requestAnimationFrame(countFrame);

  // --- lag: how late a 50ms timer actually fires ---
  let lastLagMs = 0;
  function scheduleLagProbe() {
    const expected = performance.now() + 50;
    setTimeout(() => {
      lastLagMs = Math.max(0, performance.now() - expected);
      scheduleLagProbe();
    }, 50);
  }
  scheduleLagProbe();

  function tick() {
    if (hasHeapInfo) {
      const heapPctVal = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
      pushValue(heapHistory, heapPctVal);
      renderHistory(heapBar, heapHistory);
      heapPct.textContent = heapPctVal + '%';
    }

    const fps = frameCount;
    frameCount = 0;
    const fpsLoadPct = Math.max(0, Math.min(100, Math.round(((60 - fps) / 60) * 100)));
    pushValue(fpsHistory, fpsLoadPct);
    renderHistory(fpsBar, fpsHistory);
    fpsPct.textContent = fps + 'fps';

    const lagPctVal = Math.max(0, Math.min(100, Math.round((lastLagMs / 50) * 100)));
    pushValue(lagHistory, lagPctVal);
    renderHistory(lagBar, lagHistory);
    lagPct.textContent = Math.round(lastLagMs) + 'ms';
  }

  tick();
  setInterval(tick, 1200);
}
