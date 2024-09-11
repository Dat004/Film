import {
  previewInfoFilmSlice,
  videoPlayerSlice,
  authSlice,
} from "../slices";

const reducers = {
  previewInfoFilm: previewInfoFilmSlice.reducer,
  videoPlayer: videoPlayerSlice.reducer,
  auth: authSlice.reducer,
};

export default reducers;
