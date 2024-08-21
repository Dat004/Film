import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isShowPreview: false,
  currentPreviewData: {},
  listPreviewData: [],
  position: {
    x: 0,
    y: 0,
  },
};

const previewInfoFilmSlice = createSlice({
  name: "previewInfoFilm",
  initialState,
  reducers: {
    setShowPreview: (state, action) => {
      state.isShowPreview = action.payload;
    },
    setCurrentPreviewData: (state, action) => {
      state.currentPreviewData = { ...action.payload };
    },
    setPosition: (state, action) => {
      const { x, y } = action.payload;

      state.position.x = x;
      state.position.y = y;
    },
    setListPreviewData: (state, action) => {
      state.listPreviewData.push(action.payload);
    },
  },
});

export const {
  setShowPreview,
  setCurrentPreviewData,
  setListPreviewData,
  setPosition,
} = previewInfoFilmSlice.actions;
export default previewInfoFilmSlice;
