/** Shared YouTube embed URL for banner trailer autoplay. */
export function buildBannerYoutubeEmbedUrl(trailerId: string): string {
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const qs = [
    'autoplay=1',
    'mute=1',
    'controls=0',
    'rel=0',
    'modestbranding=1',
    'playsinline=1',
    'iv_load_policy=3',
    origin ? `origin=${origin}` : '',
  ]
    .filter(Boolean)
    .join('&');
  return `https://www.youtube-nocookie.com/embed/${trailerId}?${qs}`;
}

export type { BannerTransitionMode } from '../constants/banner.constants';
export { BANNER_SLIDE_SPEED_MS, BANNER_AUTOPLAY_MS } from '../constants/banner.constants';
