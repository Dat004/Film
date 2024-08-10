import { videoPlayerSlice, authSlice } from "../slices";

const reducers = {
  videoPlayer: videoPlayerSlice.reducer,
  auth: authSlice.reducer,
};

export default reducers;
