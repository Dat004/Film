import {
  videoPlayerSlice,
  authSlice,
  continueWatchingSlice,
  previewInfoFilmSlice,
} from "../slices";

const reducers = {
  continueWatching: continueWatchingSlice.reducer,
  previewInfoFilm: previewInfoFilmSlice.reducer,
  videoPlayer: videoPlayerSlice.reducer,
  auth: authSlice.reducer,
};

export default reducers;
