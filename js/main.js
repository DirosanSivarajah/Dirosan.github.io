import { revealBootLines, startClock } from './boot.js?v=4';
import { startFeed } from './feed.js?v=4';
import { initPrompt } from './prompt.js?v=4';
import { createHiddenFile, registerHiddenFileHit } from './hidden-file.js?v=4';
import { enterArchive, exitArchive, wireArchiveLinks } from './hub.js?v=4';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

startClock(document.getElementById('clock'));
revealBootLines(reduceMotion);

const oddFile = document.getElementById('oddFile');
const grantedBtn = document.getElementById('grantedBtn');
const bootView = document.getElementById('bootView');
const archiveView = document.getElementById('archiveView');
const backLine = document.getElementById('backLine');

const hiddenFile = createHiddenFile();
oddFile.addEventListener('click', () => {
  const result = registerHiddenFileHit(hiddenFile);
  if (result.justUnlocked) {
    oddFile.classList.add('found');
    oddFile.textContent = 'unindexed.tmp';
    grantedBtn.classList.add('show');
  } else {
    oddFile.classList.add('close');
  }
});

grantedBtn.addEventListener('click', () => enterArchive(bootView, archiveView));
backLine.addEventListener('click', () => exitArchive(bootView, archiveView));
wireArchiveLinks(document.querySelectorAll('tr.entry:not(.reserved)'));

initPrompt(document.getElementById('cmdInput'), document.getElementById('sessionLog'));
startFeed(document.getElementById('feedList'), reduceMotion);
