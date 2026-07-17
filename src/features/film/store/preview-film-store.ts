import { create } from 'zustand';

import { PREVIEW_HIDE_GRACE_MS } from '../constants/preview.constants';
import type { FilmDetail, PreviewAnchorRect, PreviewFilmState } from '../types/film.types';

const HIDE_GRACE_MS = PREVIEW_HIDE_GRACE_MS;

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let previewRequestSeq = 0;

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export const usePreviewFilmStore = create<PreviewFilmState>((set, get) => ({
  isShowPreview: false,
  isPreviewLoading: false,
  previewRequestId: 0,
  currentPreviewData: {},
  listPreviewData: [],
  anchorRect: null,

  setShowPreview: (payload) => set({ isShowPreview: payload }),
  setCurrentPreviewData: (payload) => set({ currentPreviewData: { ...payload } }),
  setPreviewAnchor: (payload) =>
    set({
      anchorRect: payload
        ? {
            left: payload.left,
            top: payload.top,
            width: payload.width,
            height: payload.height,
          }
        : null,
    }),
  setListPreviewData: (payload) =>
    set((state) => {
      const id = payload?._id;
      const slug = payload?.slug;
      const exists = state.listPreviewData.some((item) => {
        if (id && item._id === id) return true;
        if (slug && item.slug === slug) return true;
        return false;
      });
      if (exists) {
        return {
          listPreviewData: state.listPreviewData.map((item) => {
            if ((id && item._id === id) || (slug && item.slug === slug)) {
              return { ...item, ...payload };
            }
            return item;
          }),
        };
      }
      return { listPreviewData: [...state.listPreviewData, payload] };
    }),
  beginPreviewSwap: (seed = {}) => {
    clearHideTimer();
    const requestId = ++previewRequestSeq;
    set({
      previewRequestId: requestId,
      isPreviewLoading: true,
      // Clear stale content before loading another preview.
      currentPreviewData: { ...seed },
      isShowPreview: true,
    });
    return requestId;
  },
  commitPreviewData: (requestId, payload) => {
    if (get().previewRequestId !== requestId) return false;
    set({
      currentPreviewData: { ...payload },
      isPreviewLoading: false,
      isShowPreview: true,
    });
    return true;
  },
  setPreviewReadyFromCache: (payload) => {
    clearHideTimer();
    const requestId = ++previewRequestSeq;
    set({
      previewRequestId: requestId,
      isPreviewLoading: false,
      currentPreviewData: { ...payload },
      isShowPreview: true,
    });
    return requestId;
  },
}));

export const setShowPreview = (payload: boolean) => {
  if (payload) clearHideTimer();
  usePreviewFilmStore.getState().setShowPreview(payload);
};

/** Delays closing while the pointer moves from the card to the overlay. */
export const scheduleHidePreview = (delayMs: number = HIDE_GRACE_MS) => {
  clearHideTimer();
  hideTimer = setTimeout(() => {
    hideTimer = null;
    usePreviewFilmStore.getState().setShowPreview(false);
  }, delayMs);
};

export const cancelHidePreview = () => {
  clearHideTimer();
};

export const setCurrentPreviewData = (payload: Partial<FilmDetail>) =>
  usePreviewFilmStore.getState().setCurrentPreviewData(payload);

export const setPreviewAnchor = (payload: PreviewAnchorRect | null) =>
  usePreviewFilmStore.getState().setPreviewAnchor(payload);

export const setListPreviewData = (payload: Partial<FilmDetail>) =>
  usePreviewFilmStore.getState().setListPreviewData(payload);

export const beginPreviewSwap = (seed?: Partial<FilmDetail>) =>
  usePreviewFilmStore.getState().beginPreviewSwap(seed);

export const commitPreviewData = (requestId: number, payload: Partial<FilmDetail>) =>
  usePreviewFilmStore.getState().commitPreviewData(requestId, payload);

export const setPreviewReadyFromCache = (payload: Partial<FilmDetail>) =>
  usePreviewFilmStore.getState().setPreviewReadyFromCache(payload);

export default usePreviewFilmStore;
