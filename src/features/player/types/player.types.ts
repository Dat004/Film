import type { Episode, EpisodeServerData } from '@/features/film';

export interface StatusMovie {
  isMuted: boolean;
  isPlay: boolean;
  isFullScreen: boolean;
  isLight: boolean;
  autoPlay: boolean;
  autoNext: boolean;
  isTheater: boolean;
  playbackRate: number;
  currentVolume: number;
}

/** Preferences persisted in localStorage. */
export type PlayerPreferenceKey =
  'isLight' | 'autoPlay' | 'autoNext' | 'isTheater' | 'playbackRate';

export interface PlayerPreferences {
  isLight: boolean;
  autoPlay: boolean;
  autoNext: boolean;
  isTheater: boolean;
  playbackRate: number;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

export const DEFAULT_PLAYER_PREFERENCES: PlayerPreferences = {
  isLight: false,
  autoPlay: false,
  autoNext: false,
  isTheater: false,
  playbackRate: 1,
};

export interface VideoTime {
  currentTime: number;
  duration: number;
}

export interface EpisodeState {
  splitEpisodes: EpisodeServerData[][];
  currentIndexSplitEpisodes: number;
  currentEpisode: number;
}

export interface MovieState {
  movieData: Record<string, unknown>;
}

export interface VideoPlayerStore {
  statusMovie: StatusMovie;
  time: VideoTime;
  episode: EpisodeState;
  movie: MovieState;
  setStatusMovie: (payload: {
    key: keyof StatusMovie;
    value: StatusMovie[keyof StatusMovie];
  }) => void;
  setTimeVideo: (payload: { key: keyof VideoTime; value: number }) => void;
  setSplitEpisodes: (payload: EpisodeServerData[][]) => void;
  setCurrentIndexSplitEpisodes: (payload: number) => void;
  setCurrentEpisode: (payload: number) => void;
  setMovieData: (payload: Record<string, unknown>) => void;
  resetEpisode: () => void;
  resetMovie: () => void;
  /** Clears playback position when switching films. */
  resetTime: () => void;
}
