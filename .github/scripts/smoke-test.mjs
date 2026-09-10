// Loads the site in a real headless browser and checks that it actually
// works — not just that the files parse. Fails the build if anything
// throws, or if the core interaction (find the hidden file, unlock the
// archive, talk to the prompt) doesn't behave as expected.
//
// Runs with prefers-reduced-motion emulated so the intro sequence settles
// in under a second instead of the real ~13s typewriter/avatar sequence —
// this also exercises the reduced-motion code path as a side effect.

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const PORT = 8931;
const URL = `http://localhost:${PORT}/`;

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    (function poll() {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() > deadline) reject(new Error('server did not start in time'));
          else setTimeout(poll, 200);
        });
    })();
  });
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

async function waitForCondition(page, fn, timeoutMs, description) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await page.evaluate(fn)) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  fail(`timed out waiting for: ${description}`);
  return false;
}

const server = spawn('python3', ['-m', 'http.server', String(PORT)], { stdio: 'ignore' });

try {
  await waitForServer(URL, 10000);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') pageErrors.push(msg.text());
  });

  await page.goto(URL, { waitUntil: 'networkidle0' });

  const deskShown = await waitForCondition(
    page,
    () => document.getElementById('desk')?.classList.contains('show'),
    8000,
    'intro sequence to finish and #desk to show'
  );

  if (deskShown) {
    const state = await page.evaluate(() => ({
      oddFileExists: !!document.getElementById('oddFile'),
      bootLinesShown: document.querySelectorAll('.boot-line.show').length,
      bootLinesTotal: document.querySelectorAll('.boot-line').length,
      feedLines: document.getElementById('feedList')?.children.length ?? 0
    }));

    if (!state.oddFileExists) fail('#oddFile not found on the page');
    if (state.bootLinesShown !== state.bootLinesTotal) {
      fail(`only ${state.bootLinesShown}/${state.bootLinesTotal} boot lines revealed after intro completed`);
    }
    if (state.feedLines < 1) fail('side-monitor feed produced no lines');

    await page.type('#cmdInput', 'whoami');
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 200));
    const promptReply = await page.evaluate(() => document.getElementById('sessionLog').innerText);
    if (!promptReply.includes('dirosan')) {
      fail(`prompt did not reply correctly to 'whoami', got: ${JSON.stringify(promptReply)}`);
    }

    await page.click('#oddFile');
    await page.click('#oddFile');
    await page.click('#oddFile');
    await page.click('#grantedBtn');
    await new Promise((r) => setTimeout(r, 200));
    const archiveShowing = await page.evaluate(() =>
      document.getElementById('archiveView').classList.contains('show')
    );
    if (!archiveShowing) fail('archive view did not unlock after 3 clicks on the hidden file');
  }

  if (pageErrors.length) {
    fail(`console/page errors detected:\n${pageErrors.join('\n')}`);
  }

  await browser.close();
} finally {
  server.kill();
}

if (process.exitCode) {
  console.error('\nSmoke test failed.');
} else {
  console.log('Smoke test passed: intro sequence, boot sequence, hidden-file unlock, and prompt replies all work.');
}
