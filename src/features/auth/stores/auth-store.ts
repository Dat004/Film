import { create } from "zustand";
import { UserInfo } from "@/types";

interface AuthState {
  userInfo: UserInfo | null;
  uid: string | null;
  isLoggedIn: boolean;
  avatar: string | null;
  isInitialized: boolean;
  
  // Actions
  setUserInfo: (user: UserInfo | null) => void;
  setUid: (uid: string | null) => void;
  setLogin: (loggedIn: boolean) => void;
  setAvatar: (avatar: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userInfo: null,
  uid: null,
  isLoggedIn: false,
  avatar: null,
  isInitialized: false,

  setUserInfo: (userInfo) => set({ userInfo }),
  setUid: (uid) => set({ uid }),
  setLogin: (isLoggedIn) => set({ isLoggedIn }),
  setAvatar: (avatar) => set({ avatar }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  logout: () => set({
    userInfo: null,
    uid: null,
    isLoggedIn: false,
    avatar: null,
    isInitialized: true,
  }),
}));
