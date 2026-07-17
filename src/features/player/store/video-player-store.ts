import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { EpisodeServerData } from '@/features/film';

import type { VideoPlayerStore, StatusMovie, EpisodeState } from '../types/player.types';
import { DEFAULT_PLAYER_PREFERENCES } from '../types/player.types';

export const PLAYER_PREFS_KEY = 'film-player-prefs';

const initialStatus: StatusMovie = {
  isMuted: false,
  isPlay: false,
  isFullScreen: false,
  isLight: DEFAULT_PLAYER_PREFERENCES.isLight,
  autoPlay: DEFAULT_PLAYER_PREFERENCES.autoPlay,
  autoNext: DEFAULT_PLAYER_PREFERENCES.autoNext,
  isTheater: DEFAULT_PLAYER_PREFERENCES.isTheater,
  playbackRate: DEFAULT_PLAYER_PREFERENCES.playbackRate,
  currentVolume: 1,
};

const initialEpisode: EpisodeState = {
  splitEpisodes: [],
  currentIndexSplitEpisodes: 0,
  currentEpisode: 0,
};

type PersistedPlayerSlice = {
  statusMovie: Pick<
    StatusMovie,
    'isLight' | 'autoPlay' | 'autoNext' | 'isTheater' | 'playbackRate'
  >;
};

export const useVideoPlayerStore = create<VideoPlayerStore>()(
  persist(
    (set) => ({
      statusMovie: { ...initialStatus },
      time: { currentTime: 0, duration: 0 },
      episode: { ...initialEpisode },
      movie: { movieData: {} },

      setStatusMovie: (payload) =>
        set((state) => {
          if (state.statusMovie[payload.key] === payload.value) return state;
          return {
            statusMovie: { ...state.statusMovie, [payload.key]: payload.value },
          };
        }),
      setTimeVideo: (payload) =>
        set((state) => {
          if (state.time[payload.key] === payload.value) return state;
          return {
            time: { ...state.time, [payload.key]: payload.value },
          };
        }),
      setSplitEpisodes: (payload) =>
        set((state) => {
          const prev = state.episode.splitEpisodes;
          if (
            prev.length === payload.length &&
            prev.every(
              (chunk, i) =>
                chunk === payload[i] ||
                (chunk.length === payload[i]!.length &&
                  chunk.every((ep, j) => ep?.slug === payload[i]![j]?.slug))
            )
          ) {
            return state;
          }
          return {
            episode: { ...state.episode, splitEpisodes: [...payload] },
          };
        }),
      setCurrentIndexSplitEpisodes: (payload) =>
        set((state) => {
          if (state.episode.currentIndexSplitEpisodes === payload) return state;
          return {
            episode: { ...state.episode, currentIndexSplitEpisodes: payload },
          };
        }),
      setCurrentEpisode: (payload) =>
        set((state) => {
          if (state.episode.currentEpisode === payload) return state;
          return {
            episode: { ...state.episode, currentEpisode: payload },
          };
        }),
      setMovieData: (payload) => set({ movie: { movieData: { ...payload } } }),

      resetEpisode: () => set({ episode: { ...initialEpisode } }),
      resetMovie: () => set({ movie: { movieData: {} } }),
      resetTime: () => set({ time: { currentTime: 0, duration: 0 } }),
    }),
    {
      name: PLAYER_PREFS_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedPlayerSlice => ({
        statusMovie: {
          isLight: state.statusMovie.isLight,
          autoPlay: state.statusMovie.autoPlay,
          autoNext: state.statusMovie.autoNext,
          isTheater: state.statusMovie.isTheater,
          playbackRate: state.statusMovie.playbackRate,
        },
      }),
      merge: (persisted, current) => {
        const saved = persisted as PersistedPlayerSlice | undefined;
        return {
          ...current,
          statusMovie: {
            ...current.statusMovie,
            ...(saved?.statusMovie ?? {}),
          },
        };
      },
    }
  )
);

export const setStatusMovie = (payload: {
  key: keyof StatusMovie;
  value: StatusMovie[keyof StatusMovie];
}) => useVideoPlayerStore.getState().setStatusMovie(payload);

export const setTimeVideo = (payload: { key: 'currentTime' | 'duration'; value: number }) =>
  useVideoPlayerStore.getState().setTimeVideo(payload);
export const setSplitEpisodes = (payload: EpisodeServerData[][]) =>
  useVideoPlayerStore.getState().setSplitEpisodes(payload);
export const setCurrentIndexSplitEpisodes = (payload: number) =>
  useVideoPlayerStore.getState().setCurrentIndexSplitEpisodes(payload);
export const setCurrentEpisode = (payload: number) =>
  useVideoPlayerStore.getState().setCurrentEpisode(payload);

/** Selects an episode and clears the previous playback position. */
export const selectEpisode = (payload: number) => {
  const {
    episode,
    setCurrentEpisode: setEp,
    setTimeVideo: setTime,
  } = useVideoPlayerStore.getState();
  if (episode.currentEpisode === payload) return;
  setEp(payload);
  setTime({ key: 'currentTime', value: 0 });
  setTime({ key: 'duration', value: 0 });
};

export const setMovieData = (payload: Record<string, unknown>) =>
  useVideoPlayerStore.getState().setMovieData(payload);
export const resetEpisode = () => useVideoPlayerStore.getState().resetEpisode();
export const resetMovie = () => useVideoPlayerStore.getState().resetMovie();
export const resetTime = () => useVideoPlayerStore.getState().resetTime();

export default useVideoPlayerStore;
