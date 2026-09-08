// The side monitor's live scrolling system feed.

const TEMPLATES = [
  () => ({ text: `ping ******.dirosan.com ${8 + Math.floor(Math.random() * 30)}ms`, ok: true }),
  () => ({ text: `ping ******.dirosan.com ${8 + Math.floor(Math.random() * 30)}ms`, ok: true }),
  () => ({ text: `ping *****.dirosan.com ${8 + Math.floor(Math.random() * 30)}ms`, ok: true }),
  () => ({ text: `gc: freed ${(Math.random() * 4).toFixed(1)}mb`, ok: false }),
  () => ({ text: `cache hit ratio: ${70 + Math.floor(Math.random() * 29)}%`, ok: false }),
  () => ({ text: 'cron: archive.log rotated', ok: false }),
  () => ({ text: 'session heartbeat ok', ok: true })
];

function addLine(listEl) {
  const { text, ok } = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]();
  const el = document.createElement('div');
  el.className = 'feed-line ' + (ok ? 'ok' : 'dim');
  el.textContent = '> ' + text;
  listEl.appendChild(el);
  if (listEl.children.length > 13) listEl.removeChild(listEl.firstChild);
}

export function startFeed(listEl, reduceMotion) {
  addLine(listEl);
  if (!reduceMotion) setInterval(() => addLine(listEl), 2200);
}
