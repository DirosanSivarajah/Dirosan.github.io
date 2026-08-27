// Transition between the landing sky and the card hub, plus the hub's small
// live-feeling touches.

export function revealEnterButton(enterWrapEl) {
  enterWrapEl.classList.add('show');
}

function warpTransition(flashEl, onMidFlash) {
  flashEl.classList.add('fire');
  setTimeout(() => {
    onMidFlash();
    flashEl.classList.remove('fire');
  }, 220);
}

export function enterHub(landingEl, hubEl, flashEl) {
  warpTransition(flashEl, () => {
    landingEl.style.display = 'none';
    hubEl.classList.add('show');
    window.scrollTo(0, 0);
  });
}

export function exitHub(landingEl, hubEl, flashEl) {
  warpTransition(flashEl, () => {
    hubEl.classList.remove('show');
    landingEl.style.display = 'block';
  });
}

export function startLiveSyncTicker(el) {
  let secs = 0;
  setInterval(() => {
    secs += 4;
    if (secs > 40) secs = 0;
    el.textContent = `synced ${secs}s ago`;
  }, 4000);
}
