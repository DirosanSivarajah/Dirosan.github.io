import { revealBootLines, startClock } from './boot.js?v=6';
import { startFeed } from './feed.js?v=6';
import { initPrompt } from './prompt.js?v=6';
import { createHiddenFile, registerHiddenFileHit } from './hidden-file.js?v=6';
import { enterArchive, exitArchive, wireArchiveLinks } from './archive.js?v=6';
import { runIntro } from './intro.js?v=6';
import { renderAsciiBg } from './ascii-bg.js?v=6';
import { startGauges } from './gauges.js?v=6';
import { startSession } from './session.js?v=6';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

renderAsciiBg(document.getElementById('asciiBg'));

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
wireArchiveLinks(document.querySelectorAll('tr.entry:not(.reserved):not(.pending)'));

initPrompt(document.getElementById('cmdInput'), document.getElementById('sessionLog'));

function startSystem() {
  revealBootLines(reduceMotion);
  startClock(document.getElementById('clock'));
  startFeed(document.getElementById('feedList'), reduceMotion);
  startGauges(reduceMotion);
  startSession(reduceMotion);

  const desk = document.getElementById('desk');
  desk.classList.add('show');
  const panels = [
    document.getElementById('netMonPanel'),
    document.getElementById('crtPanel'),
    document.getElementById('sysStatsPanel')
  ];
  panels.forEach((panel, i) => {
    if (reduceMotion) panel.classList.add('show');
    else setTimeout(() => panel.classList.add('show'), 300 * i);
  });
}

runIntro(reduceMotion, startSystem);
