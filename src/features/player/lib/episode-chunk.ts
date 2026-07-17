import { EPISODE_CHUNK_DEFAULT_SIZE } from '../constants/episode.constants';

/** Resolve chunk size from total episode count (legacy player rules). */
export function resolveEpisodeChunkSize(totalEpisode: number): number {
  if (totalEpisode <= 0) return 0;
  if (totalEpisode <= 35) return totalEpisode;
  if (totalEpisode < 100) return 20;
  if (totalEpisode <= 160) return 30;
  if (totalEpisode <= 240) return 40;
  if (totalEpisode <= 300) return 50;
  if (totalEpisode <= 420) return 60;
  if (totalEpisode <= 550) return 70;
  if (totalEpisode <= 720) return 80;
  if (totalEpisode <= 900) return 90;
  return EPISODE_CHUNK_DEFAULT_SIZE;
}

/** Split episode list into part buckets for the episode rail. */
export function chunkEpisodes<T>(episodes: T[]): T[][] {
  const total = episodes.length;
  const countsItem = resolveEpisodeChunkSize(total);
  if (total === 0 || countsItem <= 0) return [];

  const chunks: T[][] = [];
  let itemRemainings = 0;

  for (let i = countsItem; i < total; i += countsItem) {
    chunks.push(episodes.slice(i - countsItem, i));
    itemRemainings = i;
  }

  if (itemRemainings < total) {
    chunks.push(episodes.slice(itemRemainings));
  }

  return chunks;
}
