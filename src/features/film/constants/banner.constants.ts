/** Available banner transition modes. */
export type BannerTransitionMode = 'crossfade-parallax' | 'slide' | 'depth-dissolve';

export const BANNER_SLIDE_SPEED_MS = 720;
export const BANNER_AUTOPLAY_MS = 4000;
export const BANNER_TRAILER_DELAY_MS = 600;
export const BANNER_EXIT_MS = 220;
export const BANNER_REDUCED_MOTION_SLIDE_MS = 280;
export const BANNER_FILM_LIMIT = 5;
export const BANNER_TRANSITION_MODE: BannerTransitionMode = 'depth-dissolve';
/** Filters pointer-leave events caused by Swiper transforms. */
export const BANNER_POINTER_LEAVE_DEBOUNCE_MS = 180;
