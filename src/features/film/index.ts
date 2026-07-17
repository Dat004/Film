export { default as CategoryFilmScreen } from './components/CategoryFilmScreen';
export { default as SearchPageFilmScreen } from './components/SearchPageFilmScreen';
export {
  default as SliderFilm,
  DEFAULT_SLIDER_FILM_BREAKPOINTS,
  DENSE_SLIDER_FILM_BREAKPOINTS,
} from './components/SliderFilm';
export type { SliderFilmBreakpoints, SliderFilmProps } from './components/SliderFilm';
export { default as SliderBanner } from './components/SliderBanner';
export { default as FilmElement } from './components/FilmElement';
export type { FilmElementProps, FilmElementVariant } from './components/FilmElement';
export { default as PreviewFilmElement } from './components/Preview/PreviewFilmElement';
export { default as WatchListScreen } from './components/WatchListScreen';
export { default as ContinueWatchingVideoScreen } from './components/ContinueWatchingVideoScreen';
export { default as CurrentTime } from './components/ContinueWatchingVideoScreen/CurrentTime';
export { default as FilmMetaBadges } from './components/FilmMetaBadges';
export type { FilmMetaBadgesProps } from './components/FilmMetaBadges';
export { default as FilmTagLinks } from './components/FilmTagLinks';
export type { FilmTagLinksProps } from './components/FilmTagLinks';
export { default as CastGrid } from './components/CastGrid';
export type { CastGridProps } from './components/CastGrid';
export { default as KeywordChips } from './components/KeywordChips';
export type { KeywordChipsProps } from './components/KeywordChips';
export { default as ImagesGallery } from './components/ImagesGallery';
export type { ImagesGalleryProps } from './components/ImagesGallery';

export {
  usePreviewFilmStore,
  setShowPreview,
  scheduleHidePreview,
  cancelHidePreview,
  setCurrentPreviewData,
  setPreviewAnchor,
  setListPreviewData,
  beginPreviewSwap,
  commitPreviewData,
  setPreviewReadyFromCache,
} from './store/preview-film-store';

export {
  allDataService,
  allCategoryService,
  detailsFilmService,
  filmPeoplesService,
  filmKeywordsService,
  filmImagesService,
  searchFilmService,
  newFilmService,
  singleFilmService,
  seriesFilmService,
  cartoonService,
  tvShowService,
  countryFilmService,
  categoryFilmService,
  danhSachService,
  danhSachV1Service,
  fetchHomeBannerData,
} from './services/film.service';

export type * from './types/film.types';
export type * from './types/continue-watching.types';
export { GALLERY_SLIDE_LIMIT, GALLERY_SLIDE_SPEED_MS } from './types/film.types';

export { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
export { useFilmPreview } from './hooks/useFilmPreview';
export { useFilmExtras } from './hooks/useFilmExtras';
export { useContinueWatchingActions } from './hooks/useContinueWatchingActions';

export * from './constants';
export { mapApiMovieToFilm, mapApiMovieToFilmDetail, mapApiMovieList } from './lib/film-mappers';
