export { default as Player } from './components/PlayerContainer';
export { default as EpisodesPlayer } from './components/PlayerContainer/EpisodesPlayer';

// Keep client-only video and HLS modules out of this server-compatible barrel.

export {
  useVideoPlayerStore,
  setStatusMovie,
  setTimeVideo,
  setSplitEpisodes,
  setCurrentIndexSplitEpisodes,
  setCurrentEpisode,
  selectEpisode,
  setMovieData,
  resetEpisode,
  resetMovie,
  resetTime,
  PLAYER_PREFS_KEY,
} from './store/video-player-store';
export type * from './types/player.types';
