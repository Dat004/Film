/** Episode list chunking / search. */
export const EPISODE_SEARCH_DEBOUNCE_MS = 1000;

/**
 * How many episodes per “part” menu bucket.
 * Key thresholds are total episode count upper bounds.
 */
export const EPISODE_CHUNK_RULES: ReadonlyArray<{ maxExclusive: number; size: number }> = [
  { maxExclusive: 36, size: 0 }, // special: use total (handled in helper)
  { maxExclusive: 100, size: 20 },
  { maxExclusive: 161, size: 30 },
  { maxExclusive: 241, size: 40 },
  { maxExclusive: 301, size: 50 },
  { maxExclusive: 421, size: 60 },
  { maxExclusive: 551, size: 70 },
  { maxExclusive: 721, size: 80 },
  { maxExclusive: 901, size: 90 },
];

export const EPISODE_CHUNK_DEFAULT_SIZE = 120;
