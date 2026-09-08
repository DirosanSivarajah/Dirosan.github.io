// Transition between the boot view and the archive (the hub, styled as a
// directory listing), plus wiring the listing's rows to their subdomains.

export function enterArchive(bootViewEl, archiveViewEl) {
  bootViewEl.classList.add('hide');
  archiveViewEl.classList.add('show');
}

export function exitArchive(bootViewEl, archiveViewEl) {
  archiveViewEl.classList.remove('show');
  bootViewEl.classList.remove('hide');
}

export function wireArchiveLinks(rows) {
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      window.open(row.dataset.href, '_blank');
    });
  });
}
