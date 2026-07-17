export function parseEpisodeQuery(
  search: string,
  episodeCount: number
): { episodeIndex?: number; resumeTime?: number } {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const result: { episodeIndex?: number; resumeTime?: number } = {};

  const epParam = params.get('ep');
  if (epParam) {
    const index = Math.max(0, Number.parseInt(epParam, 10) - 1);
    if (!Number.isNaN(index) && index < episodeCount) {
      result.episodeIndex = index;
    }
  }

  const tParam = params.get('t');
  if (tParam) {
    const time = Number.parseFloat(tParam);
    if (!Number.isNaN(time) && time > 0) {
      result.resumeTime = time;
    }
  }

  return result;
}

/** Clears t when the episode changes manually. */
export function buildEpisodeQueryUrl(href: string, episodeIndex: number): string {
  const url = new URL(href);
  url.searchParams.set('ep', String(episodeIndex + 1));
  url.searchParams.delete('t');
  return `${url.pathname}${url.search}${url.hash}`;
}

export function syncEpisodeQueryToWindow(episodeIndex: number): void {
  if (typeof window === 'undefined') return;
  const next = buildEpisodeQueryUrl(window.location.href, episodeIndex);
  window.history.replaceState(window.history.state, '', next);
}
