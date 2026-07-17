/** Swiper breakpoints: key = min-width (px), value = slidesPerView */
export type SliderFilmBreakpoints = Record<number, { slidesPerView: number }>;

/** Default breakpoints for cinematic cards. */
export const DEFAULT_SLIDER_FILM_BREAKPOINTS: SliderFilmBreakpoints = {
  0: { slidesPerView: 1.15 },
  320: { slidesPerView: 1.25 },
  641: { slidesPerView: 2.1 },
  769: { slidesPerView: 2.6 },
  1281: { slidesPerView: 3 },
};

/** Denser breakpoints for portrait cards. */
export const DENSE_SLIDER_FILM_BREAKPOINTS: SliderFilmBreakpoints = {
  0: { slidesPerView: 1.2 },
  320: { slidesPerView: 2 },
  641: { slidesPerView: 3 },
  769: { slidesPerView: 4 },
  1281: { slidesPerView: 5 },
};

/** Related films: denser on desktop than cinematic home slider */
export const RELATED_SLIDER_FILM_BREAKPOINTS: SliderFilmBreakpoints = {
  0: { slidesPerView: 1.15 },
  320: { slidesPerView: 1.25 },
  641: { slidesPerView: 2 },
  769: { slidesPerView: 3 },
  1281: { slidesPerView: 4 },
};

export const SLIDER_DEFAULT_SPACE_BETWEEN = 12;
