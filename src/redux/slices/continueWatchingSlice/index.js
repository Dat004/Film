import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  continue_watching: [],
};

const continueWatchingSlice = createSlice({
  name: "continue_watching",
  initialState,
  reducers: {
    setContinueWatchingData: (state, action) => {
      state.continue_watching = [...action.payload];
    },
  },
});

export const { setContinueWatchingData } = continueWatchingSlice.actions;
export default continueWatchingSlice;
