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
  time: {
    currentTime: 0,
    duration: 0,
  },
  episode: {
    episodeArray: [],
    splitEpisodes: [],
    currentIndexSplitEpisodes: 0,
    currentEpisode: 0,
  },
  movie: {
    movieData: {},
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
    setTimeVideo: (state, action) => {
      const { key, value } = action.payload;

      state.time[key] = value;
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
    setMovieData: (state, action) => {
      state.movie.movieData = { ...action.payload };
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
    resetMovie: (state) => {
      state.movie.movieData = {};
    },
  },
});

const { actions } = videoPlayerSlice;

export const {
  setStatusMovie,
  setTimeVideo,
  setSplitEpisodes,
  setCurrentIndexSplitEpisodes,
  setCurrentEpisode,
  setMovieData,
  resetStatus,
  resetEpisode,
  resetMovie,
} = actions;
export default videoPlayerSlice;
