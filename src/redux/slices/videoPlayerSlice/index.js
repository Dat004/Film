import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  statusMovie: {
    isMuted: false,
    isSeeked: false,
    isPlay: false,
    isFullScreen: false,
    isLight: false,
    autoPlay: false,
    autoNext: false,
    currentVolume: 1,
  },
  episode: {
    episodeArray: [],
    splitEpisodes: [],
    currentIndexSplitEpisodes: 0,
    currentEpisode: 0,
  },
};

const videoPlayerSlice = createSlice({
  name: "videoPlayer",
  initialState: initialState,
  reducers: {
    setStatusMovie: (state, action) => {
      const { key, value } = action.payload;

      state.statusMovie[key] = value;
    },
    setEpisodeArray: (state, action) => {
      state.episode.episodeArray = [...action.payload];
    },
    setSplitEpisodes: (state, action) => {
      state.episode.splitEpisodes = [...action.payload];
    },
    setCurrentIndexSplitEpisodes: (state, action) => {
      state.episode.currentIndexSplitEpisodes = action.payload;
    },
    setCurrentEpisode: (state, action) => {
      state.episode.currentEpisode = action.payload;
    },
    resetStatus: (state) => {
      state.statusMovie.isFullScreen = false;
      state.statusMovie.isPlay = false;
    },
    resetEpisode: (state) => {
      state.episode.episodeArray.splice(0);
      state.episode.splitEpisodes.splice(0);
      state.episode.currentIndexSplitEpisodes = 0;
      state.episode.currentEpisode = 0;
    },
  },
});

const { actions } = videoPlayerSlice;

export const {
  setStatusMovie,
  setSplitEpisodes,
  setCurrentIndexSplitEpisodes,
  setCurrentEpisode,
  resetStatus,
  resetEpisode,
} = actions;
export default videoPlayerSlice;
