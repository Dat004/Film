import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tokenStore: {},
  logged: false,
  userInfo: {},
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
  },
});

const { actions } = authSlice;

export const { setLogin, setTokenStore, setUserInfo } = actions;
export default authSlice;
