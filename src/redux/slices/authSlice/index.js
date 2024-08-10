import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  logged: false,
  access_token: "",
  userInfo: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setLogin: (state, action) => {
      state.logged = action.payload;
    },
    setAccessToken: (state, action) => {
      state.access_token = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

const { actions } = authSlice;

export const { setLogin, setAccessToken, setUserInfo } = actions;
export default authSlice;
