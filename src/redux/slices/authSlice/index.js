import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tokenStore: {},
  logged: false,
  userInfo: {},
  avatar: null,
  uid: null,
  data: {
    continue_watching: [],
    list_watching: [],
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setLogin: (state, action) => {
      state.logged = action.payload;
    },
    setTokenStore: (state, action) => {
      state.tokenStore = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
    setUid: (state, action) => {
      state.uid = action.payload;
    },
    setContinueWatchingData: (state, action) => {
      state.data.continue_watching = [...action.payload];
    },
    setListWatchingData: (state, action) => {
      state.data.list_watching = [...action.payload];
    },
  },
});

const { actions } = authSlice;

export const {
  setLogin,
  setTokenStore,
  setUserInfo,
  setUid,
  setAvatar,
  setContinueWatchingData,
  setListWatchingData,
} = actions;
export default authSlice;
