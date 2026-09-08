// The landing sequence: a GUIDE persona types a boot narration, then an
// avatar phase confirms the system is starting, before handing off to
// the real terminal.

const INTRO_LINES = [
  'connection established.',
  'initializing core systems...',
  'loading interface modules...',
  'establishing network link...',
  'mounting personal archive...',
  'calibrating sensors...',
  'spinning up auxiliary displays...',
  'all systems nominal.',
  'initiating ./boot.sh --full'
];

const WORDMARK = 'DIROSAN';
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*01';

function fillMixGrid(el) {
  const cols = 22;
  const rows = 13;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      const isAccent = Math.random() < 0.1;
      cell.className = 'mix-cell' + (isAccent ? ' accent' : '');
      const base = (c * 0.06 + r * 0.03) % 2.8;
      const jitter = (Math.random() - 0.5) * 0.3;
      cell.style.animationDelay = (base + jitter).toFixed(2) + 's';
      cell.style.animationDuration = (2.6 + Math.random() * 0.4).toFixed(2) + 's';
      el.appendChild(cell);
    }
  }
}

function runDecrypt(el, reduceMotion) {
  if (reduceMotion) {
    el.textContent = WORDMARK;
    return;
  }
  let revealed = 0;
  const scrambleTimer = setInterval(() => {
    let out = '';
    for (let i = 0; i < WORDMARK.length; i++) {
      out += i < revealed ? WORDMARK[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    el.textContent = out;
  }, 40);
  const lockTimer = setInterval(() => {
    revealed++;
    if (revealed > WORDMARK.length) {
      clearInterval(lockTimer);
      clearInterval(scrambleTimer);
      el.textContent = WORDMARK;
    }
  }, 130);
}

export function runIntro(reduceMotion, onComplete) {
  const overlay = document.getElementById('introOverlay');
  const introText = document.getElementById('introText');
  const avatarPhase = document.getElementById('avatarPhase');

  function showAvatarPhase() {
    introText.style.display = 'none';
    avatarPhase.style.display = 'flex';
    requestAnimationFrame(() => avatarPhase.classList.add('show'));

    const fill = document.getElementById('avatarLoadFill');
    setTimeout(() => { fill.style.width = '100%'; }, reduceMotion ? 0 : 150);

    const pctEl = document.getElementById('avatarPct');
    if (reduceMotion) {
      pctEl.textContent = '100%';
    } else {
      const start = Date.now();
      const duration = 1600;
      const pctTimer = setInterval(() => {
        const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
        pctEl.textContent = pct + '%';
        if (pct >= 100) clearInterval(pctTimer);
      }, 60);
    }

    fillMixGrid(document.getElementById('mixGrid'));
    runDecrypt(document.getElementById('mixText'), reduceMotion);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => { overlay.style.display = 'none'; }, 700);
      onComplete();
    }, reduceMotion ? 400 : 2200);
  }

  function typeLine(i) {
    if (i >= INTRO_LINES.length) {
      showAvatarPhase();
      return;
    }

    const lineEl = document.createElement('div');
    lineEl.className = 'intro-line';
    const prefix = document.createElement('span');
    prefix.className = 'guide-prefix';
    prefix.textContent = 'GUIDE> ';
    const msg = document.createElement('span');
    const cursor = document.createElement('span');
    cursor.className = 'intro-cursor';
    lineEl.append(prefix, msg, cursor);
    introText.appendChild(lineEl);

    if (reduceMotion) {
      msg.textContent = INTRO_LINES[i];
      cursor.remove();
      setTimeout(() => typeLine(i + 1), 300);
      return;
    }

    const text = INTRO_LINES[i];
    let c = 0;
    (function step() {
      msg.textContent = text.slice(0, c + 1);
      c++;
      if (c < text.length) {
        setTimeout(step, 22);
      } else {
        cursor.remove();
        setTimeout(() => typeLine(i + 1), 550);
      }
    })();
  }

  typeLine(0);
}
