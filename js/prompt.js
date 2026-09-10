// The interactive command prompt — a real input that replies per command.

const REPLIES = {
  whoami: 'dirosan',
  help: 'available commands: whoami, ls, date, sudo, clear',
  ls: 'archive.log  network.log  ????????.tmp',
  date: () => new Date().toString(),
  sudo: 'nice try. permission denied.'
};

export function initPrompt(inputEl, logEl) {
  inputEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = inputEl.value.trim();
    if (!raw) return;
    const cmd = raw.toLowerCase();

    const echo = document.createElement('div');
    echo.className = 'line';
    const userSpan = document.createElement('span');
    userSpan.className = 'white';
    userSpan.textContent = 'guest@dirosan';
    const hostSpan = document.createElement('span');
    hostSpan.className = 'dim';
    hostSpan.textContent = ':~$ ';
    const rawSpan = document.createElement('span');
    rawSpan.textContent = raw;
    echo.append(userSpan, hostSpan, rawSpan);
    logEl.appendChild(echo);

    if (cmd === 'clear') {
      logEl.innerHTML = '';
    } else {
      const resp = document.createElement('div');
      resp.className = 'line dim';
      if (cmd in REPLIES) {
        const val = REPLIES[cmd];
        resp.textContent = typeof val === 'function' ? val() : val;
      } else {
        resp.textContent = `command not found: ${raw} — try 'help'`;
      }
      logEl.appendChild(resp);
    }

    inputEl.value = '';
    logEl.scrollTop = logEl.scrollHeight;
  });
}
