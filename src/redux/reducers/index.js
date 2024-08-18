import { videoPlayerSlice, authSlice, continueWatchingSlice } from "../slices";

const reducers = {
  continueWatching: continueWatchingSlice.reducer,
  videoPlayer: videoPlayerSlice.reducer,
  auth: authSlice.reducer,
};

export default reducers;
