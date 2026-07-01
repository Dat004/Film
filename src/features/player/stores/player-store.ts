import { create } from "zustand";

interface PlayerTime {
  currentTime: number;
  duration: number;
}

interface PlayerEpisode {
  episodeArray: any[];
  splitEpisodes: any[];
  currentIndexSplitEpisodes: number;
  currentEpisode: number;
}

interface PlayerState {
  isMuted: boolean;
  isSeeked: boolean;
  isPlay: boolean;
  isFullScreen: boolean;
  isLight: boolean;
  autoPlay: boolean;
  autoNext: boolean;
  currentVolume: number;
  
  time: PlayerTime;
  episode: PlayerEpisode;
  movieData: any;

  // Actions for status
  setIsPlay: (play: boolean) => void;
  togglePlay: () => void;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setCurrentVolume: (vol: number) => void;
  setIsFullScreen: (fs: boolean) => void;
  toggleFullScreen: () => void;
  toggleLight: () => void;
  toggleAutoPlay: () => void;
  toggleAutoNext: () => void;
  setIsSeeked: (seeked: boolean) => void;

  // Actions for time
  setTimeVideo: (key: keyof PlayerTime, value: number) => void;
  
  // Actions for episode
  setEpisodeArray: (arr: any[]) => void;
  setSplitEpisodes: (arr: any[]) => void;
  setCurrentIndexSplitEpisodes: (index: number) => void;
  setCurrentEpisode: (episodeIndex: number) => void;
  setAllEpisodes: (arr: any[]) => void;
  
  // Actions for movie
  setMovieData: (data: any) => void;
  
  // Resets
  resetStatus: () => void;
  resetEpisode: () => void;
  resetMovie: () => void;
  reset: () => void;
}

const initialTime: PlayerTime = {
  currentTime: 0,
  duration: 0,
};

const initialEpisode: PlayerEpisode = {
  episodeArray: [],
  splitEpisodes: [],
  currentIndexSplitEpisodes: 0,
  currentEpisode: 0,
};

export const usePlayerStore = create<PlayerState>((set) => ({
  isMuted: false,
  isSeeked: false,
  isPlay: false,
  isFullScreen: false,
  isLight: false,
  autoPlay: false,
  autoNext: false,
  currentVolume: 1,

  time: { ...initialTime },
  episode: { ...initialEpisode },
  movieData: {},

  setIsPlay: (isPlay) => set({ isPlay }),
  togglePlay: () => set((state) => ({ isPlay: !state.isPlay })),
  
  setIsMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted, currentVolume: state.isMuted ? 1 : 0 })),
  
  setCurrentVolume: (currentVolume) => set({ currentVolume, isMuted: currentVolume === 0 }),
  
  setIsFullScreen: (isFullScreen) => set({ isFullScreen }),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
  
  toggleLight: () => set((state) => ({ isLight: !state.isLight })),
  toggleAutoPlay: () => set((state) => ({ autoPlay: !state.autoPlay })),
  toggleAutoNext: () => set((state) => ({ autoNext: !state.autoNext })),
  
  setIsSeeked: (isSeeked) => set({ isSeeked }),

  setTimeVideo: (key, value) =>
    set((state) => ({
      time: { ...state.time, [key]: value },
    })),

  setEpisodeArray: (episodeArray) =>
    set((state) => ({
      episode: { ...state.episode, episodeArray },
    })),

  setSplitEpisodes: (splitEpisodes) =>
    set((state) => ({
      episode: { ...state.episode, splitEpisodes },
    })),

  setCurrentIndexSplitEpisodes: (currentIndexSplitEpisodes) =>
    set((state) => ({
      episode: { ...state.episode, currentIndexSplitEpisodes },
    })),

  setCurrentEpisode: (currentEpisode) =>
    set((state) => ({
      episode: { ...state.episode, currentEpisode },
    })),

  setAllEpisodes: (episodeArray) =>
    set((state) => ({
      episode: { ...state.episode, episodeArray },
    })),

  setMovieData: (movieData) => set({ movieData: { ...movieData } }),

  resetStatus: () =>
    set({
      isFullScreen: false,
      isPlay: false,
    }),

  resetEpisode: () =>
    set({ episode: { ...initialEpisode } }),

  resetMovie: () => set({ movieData: {} }),

  reset: () =>
    set({
      isMuted: false,
      isSeeked: false,
      isPlay: false,
      isFullScreen: false,
      isLight: false,
      autoPlay: false,
      autoNext: false,
      currentVolume: 1,
      time: { ...initialTime },
      episode: { ...initialEpisode },
      movieData: {},
    }),
}));
