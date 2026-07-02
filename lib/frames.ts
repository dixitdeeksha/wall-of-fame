export const MIN_ROWS = 3;
export const MAX_SIGNATURES = 100;
export const REGISTRATION_URL = "https://forms.gle/orBRhUVpKYonykMG9";

export function getColumns(width: number): number {
  if (width >= 900) return 8;
  if (width >= 600) return 6;
  return 4;
}

export function seededRotation(index: number): number {
  const x = Math.sin(index * 999.7) * 10000;
  const r = x - Math.floor(x);
  return parseFloat((r * 10 - 5).toFixed(1));
}

export function totalFramesNeeded(
  signatureCount: number,
  cols: number,
  minRows = MIN_ROWS
): number {
  const rows = Math.max(minRows, Math.ceil((signatureCount + 1) / cols));
  return rows * cols;
}

export function autosizeSignature(
  sigEl: HTMLElement,
  frameEl: HTMLElement
): number {
  const maxWidth = frameEl.clientWidth * 0.84;
  const maxHeight = frameEl.clientHeight * 0.78;
  let fontSize = Math.min(maxHeight, 34);
  sigEl.style.fontSize = `${fontSize}px`;
  let guard = 0;
  while (fontSize > 9 && sigEl.scrollWidth > maxWidth && guard < 40) {
    fontSize -= 1;
    sigEl.style.fontSize = `${fontSize}px`;
    guard++;
  }
  return fontSize;
}
