// "This session" block — fills the sidebar gap with real, verifiable
// values read straight from the browser: how long you've been here,
// your actual viewport size, and your timezone. Nothing invented.

export function startSession(reduceMotion) {
  const uptimeEl = document.getElementById('sessionUptime');
  const viewportEl = document.getElementById('sessionViewport');
  const tzEl = document.getElementById('sessionTz');
  if (!uptimeEl) return;

  function paintViewport() {
    viewportEl.textContent = `${window.innerWidth}×${window.innerHeight}`;
  }
  paintViewport();
  window.addEventListener('resize', paintViewport);

  tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
  document.getElementById('sessionScreen').textContent = `${window.screen.width}×${window.screen.height}`;
  document.getElementById('sessionLang').textContent = navigator.language || '—';

  const onlineEl = document.getElementById('sessionOnline');
  function paintOnline() { onlineEl.textContent = navigator.onLine ? 'connected' : 'offline'; }
  paintOnline();
  window.addEventListener('online', paintOnline);
  window.addEventListener('offline', paintOnline);

  const start = Date.now();
  function tick() {
    const s = Math.floor((Date.now() - start) / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    uptimeEl.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  if (!reduceMotion) setInterval(tick, 1000);
}
