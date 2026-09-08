// A faint ASCII-character texture rendered behind the monitors, instead
// of flat black.

export function renderAsciiBg(el) {
  const chars = '.:-+#';
  const cols = 160;
  const rows = 60;
  let out = '';
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const wave = Math.sin(x * 0.15 + y * 0.3) + Math.sin(x * 0.05 - y * 0.1);
      const idx = Math.max(0, Math.min(chars.length - 1, Math.floor(((wave + 2) / 4) * chars.length)));
      line += Math.random() < 0.55 ? chars[idx] : ' ';
    }
    out += line + '\n';
  }
  el.textContent = out;
}
