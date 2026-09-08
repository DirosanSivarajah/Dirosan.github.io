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

    const syncValue = document.getElementById('coreSyncValue');
    if (reduceMotion) {
      syncValue.textContent = '100%';
    } else {
      const syncStart = Date.now();
      const syncDuration = 1600;
      const syncTimer = setInterval(() => {
        const pct = Math.min(100, Math.round(((Date.now() - syncStart) / syncDuration) * 100));
        syncValue.textContent = pct + '%';
        if (pct >= 100) clearInterval(syncTimer);
      }, 60);
    }

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
