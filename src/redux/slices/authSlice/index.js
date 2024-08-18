import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tokenStore: {},
  logged: false,
  userInfo: {},
  uid: null,
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
    setUid: (state, action) => {
      state.uid = action.payload;
    },
  },
});

const { actions } = authSlice;

export const { setLogin, setTokenStore, setUserInfo, setUid } = actions;
export default authSlice;
