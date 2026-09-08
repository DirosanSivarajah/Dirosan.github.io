// The hidden trigger — an oddly-named file among the boot log's directory
// listing. Three clicks unlock the archive, same mechanic as before, just
// reframed for the terminal.

const HITS_NEEDED = 3;

export function createHiddenFile() {
  return { hits: 0, unlocked: false };
}

export function registerHiddenFileHit(state) {
  if (state.unlocked) return { justUnlocked: false, hits: state.hits };
  state.hits++;
  const justUnlocked = state.hits >= HITS_NEEDED;
  if (justUnlocked) state.unlocked = true;
  return { justUnlocked, hits: state.hits };
}
