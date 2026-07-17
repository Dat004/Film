/** Playback chrome / gesture / CW thresholds. */
export const AUTO_HIDE_MS = 3000;
export const DOUBLE_TAP_MS = 300;
/** Stack successive double-taps into 10 → 20 → 30… like YouTube */
export const SEEK_STACK_MS = 1400;
export const SEEK_STEP_S = 10;
export const SEEK_CHANGE_DEBOUNCE_MS = 500;
export const PLAY_FLASH_MS = 650;
export const PLAYBACK_DRIFT_SYNC_S = 0.75;
export const PLAYBACK_LOCKED_DRIFT_S = 1.5;
/** Only persist continue-watching after this many seconds watched. */
export const CONTINUE_WATCHING_PROGRESS_MIN_S = 10;
export const CONTINUE_WATCHING_PATH_PREFIX = '/continue_watching';
