// The landing sequence: WELCOME banner, GUIDE narration, three panels
// booting in parallel, then the decrypt wordmark. Skippable at any
// point — every timer is tracked so a skip cancels whatever's pending.

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

// 5x7 bitmap dot-matrix font — just the letters "WELCOME" and "DIROSAN" need.
const BITMAP_FONT = {
  W: ['10001','10001','10001','10101','10101','11011','10001'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  N: ['10001','11001','10101','10101','10011','10001','10001']
};
const WELCOME_WORD = 'WELCOME';
const WORDMARK = 'DIROSAN';

// The desk's three real panels, each with its own honest boot log and
// a slightly different pace so they don't finish in lockstep.
const MINI_LOGS = [
  { id: 'miniLogA', gapMs: 230, lines: [
    { text: 'starting live feed...', ok: false },
    { text: 'reading session info...', ok: true },
    { text: 'starting gauges...', ok: true }
  ] },
  { id: 'miniLogB', gapMs: 270, lines: [
    { text: 'mounting /home/dirosan', ok: false },
    { text: 'loading archive index...', ok: true },
    { text: 'starting prompt shell...', ok: true }
  ] },
  { id: 'miniLogC', gapMs: 310, lines: [
    { text: 'tracing connections...', ok: false },
    { text: 'building schematic...', ok: true },
    { text: 'scanning /var/log...', ok: true }
  ] }
];
const MINI_DONE_DELAY_MS = 300;
const MINI_READ_PAUSE_MS = 650;
const MINI_CONVERGE_MS = 500;

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

function buildBitmapWord(word, container, reduceMotion) {
  container.innerHTML = '';
  let colOffset = 0;
  for (const ch of word) {
    const pattern = BITMAP_FONT[ch];
    const letterEl = document.createElement('div');
    letterEl.className = 'wletter';
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r].length; c++) {
        const on = pattern[r][c] === '1';
        const cell = document.createElement('div');
        cell.className = 'wcell' + (on ? ' on' : '');
        if (on) {
          if (reduceMotion) {
            cell.classList.add('lit');
          } else {
            const sweepDelay = Math.min(400, (colOffset + c) * 11);
            cell.style.animationDelay = sweepDelay + 'ms';
            requestAnimationFrame(() => cell.classList.add('lit'));
          }
        }
        letterEl.appendChild(cell);
      }
    }
    colOffset += pattern[0].length;
    container.appendChild(letterEl);
  }
}

export function runIntro(reduceMotion, onComplete) {
  const overlay = document.getElementById('introOverlay');
  const introText = document.getElementById('introText');
  const multiBoot = document.getElementById('multiBoot');
  const wordmarkPhase = document.getElementById('wordmarkPhase');
  const skipBtn = document.getElementById('introSkip');

  let done = false;
  const timers = [];
  function after(fn, ms) {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }
  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    skipBtn.removeEventListener('click', finish);
    document.removeEventListener('keydown', onKeydown);
    overlay.classList.add('fade-out');
    setTimeout(() => { overlay.style.display = 'none'; }, reduceMotion ? 0 : 400);
    onComplete();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') finish();
  }
  skipBtn.addEventListener('click', finish);
  document.addEventListener('keydown', onKeydown);

  function appendRow(logEl, text, cls) {
    const row = document.createElement('div');
    row.className = 'row' + (cls ? ' ' + cls : '');
    row.textContent = cls === 'done' ? text : '> ' + text;
    logEl.appendChild(row);
  }

  function showMultiBoot() {
    introText.style.display = 'none';
    multiBoot.style.display = 'flex';
    multiBoot.classList.remove('converge');
    requestAnimationFrame(() => multiBoot.classList.add('show'));

    if (reduceMotion) {
      MINI_LOGS.forEach(({ id, lines }) => {
        const logEl = document.getElementById(id);
        lines.forEach((line) => appendRow(logEl, line.text, line.ok ? 'ok' : ''));
        appendRow(logEl, 'done', 'done');
      });
      after(showWordmarkPhase, 250);
      return;
    }

    let latestFinish = 0;
    MINI_LOGS.forEach(({ id, gapMs, lines }) => {
      const logEl = document.getElementById(id);
      lines.forEach((line, i) => {
        after(() => appendRow(logEl, line.text, line.ok ? 'ok' : ''), i * gapMs);
      });
      const lastLineAt = (lines.length - 1) * gapMs;
      const doneAt = lastLineAt + MINI_DONE_DELAY_MS;
      after(() => appendRow(logEl, 'done', 'done'), doneAt);
      latestFinish = Math.max(latestFinish, doneAt);
    });

    // let the slowest terminal's "done" sit on screen for a beat, then
    // converge all three toward the center before handing off
    after(() => {
      multiBoot.classList.add('converge');
      after(showWordmarkPhase, MINI_CONVERGE_MS);
    }, latestFinish + MINI_READ_PAUSE_MS);
  }

  function showWordmarkPhase() {
    multiBoot.style.display = 'none';
    introText.style.display = 'none';
    wordmarkPhase.style.display = 'flex';
    requestAnimationFrame(() => wordmarkPhase.classList.add('show'));

    const fill = document.getElementById('wordmarkLoadFill');
    after(() => { fill.style.width = '100%'; }, reduceMotion ? 0 : 150);

    const pctEl = document.getElementById('wordmarkPct');
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
      timers.push(pctTimer);
    }

    fillMixGrid(document.getElementById('mixGrid'));
    buildBitmapWord(WORDMARK, document.getElementById('mixLetters'), reduceMotion);

    after(finish, reduceMotion ? 400 : 2200);
  }

  function typeLine(i) {
    if (i >= INTRO_LINES.length) {
      showMultiBoot();
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
      after(() => typeLine(i + 1), 300);
      return;
    }

    const text = INTRO_LINES[i];
    let c = 0;
    (function step() {
      msg.textContent = text.slice(0, c + 1);
      c++;
      if (c < text.length) {
        after(step, 22);
      } else {
        cursor.remove();
        after(() => typeLine(i + 1), 550);
      }
    })();
  }

  function showWelcome() {
    const welcomePhase = document.getElementById('welcomePhase');
    if (reduceMotion) {
      welcomePhase.style.display = 'none';
      typeLine(0);
      return;
    }
    buildBitmapWord(WELCOME_WORD, document.getElementById('welcomeLetters'), false);
    requestAnimationFrame(() => welcomePhase.classList.add('show'));
    after(() => {
      welcomePhase.classList.add('leaving');
      after(() => {
        welcomePhase.style.display = 'none';
        typeLine(0);
      }, 500);
    }, 2400);
  }

  showWelcome();
}
