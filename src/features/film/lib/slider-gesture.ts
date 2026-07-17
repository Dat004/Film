/** Suppresses one compatibility click after a slider drag. */
let ignoreNextNavClick = false;
let expireTimer: ReturnType<typeof setTimeout> | null = null;

export function armIgnoreNextNavClick(ms = 450) {
  ignoreNextNavClick = true;
  if (expireTimer) clearTimeout(expireTimer);
  expireTimer = setTimeout(() => {
    ignoreNextNavClick = false;
    expireTimer = null;
  }, ms);
}

/** Returns true when the current click should be ignored. */
export function consumeIgnoreNextNavClick() {
  if (!ignoreNextNavClick) return false;
  ignoreNextNavClick = false;
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
  return true;
}

export function clearIgnoreNextNavClick() {
  ignoreNextNavClick = false;
  if (expireTimer) {
    clearTimeout(expireTimer);
    expireTimer = null;
  }
}
