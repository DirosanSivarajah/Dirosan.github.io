// Transition between the boot view and the archive (the hub, styled as a
// directory listing), plus wiring the listing's rows to their subdomains.

const FADE_MS = 350;

function fadeIn(el) {
  el.classList.add('view-fading');
  // force a style flush so the browser registers the faded-out starting
  // point before we remove the class, or the transition won't run
  void el.offsetWidth;
  el.classList.remove('view-fading');
}

export function enterArchive(bootViewEl, archiveViewEl, reduceMotion) {
  if (reduceMotion) {
    bootViewEl.classList.add('hide');
    archiveViewEl.classList.add('show');
    return;
  }
  bootViewEl.classList.add('view-fading');
  setTimeout(() => {
    bootViewEl.classList.add('hide');
    bootViewEl.classList.remove('view-fading');
    archiveViewEl.classList.add('show');
    fadeIn(archiveViewEl);
  }, FADE_MS);
}

export function exitArchive(bootViewEl, archiveViewEl, reduceMotion) {
  if (reduceMotion) {
    archiveViewEl.classList.remove('show');
    bootViewEl.classList.remove('hide');
    return;
  }
  archiveViewEl.classList.add('view-fading');
  setTimeout(() => {
    archiveViewEl.classList.remove('show', 'view-fading');
    bootViewEl.classList.remove('hide');
    fadeIn(bootViewEl);
  }, FADE_MS);
}

export function wireArchiveLinks(rows) {
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      window.open(row.dataset.href, '_blank');
    });
  });
}
