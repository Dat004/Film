import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { AUTH_STORAGE_KEY } from '../lib/auth-constants';
import { setAuthCookie } from '../lib/auth-persistence';
import type {
  AuthState,
  ContinueWatchingItem,
  UserInfo,
  WatchListGroup,
} from '../types/auth.types';

const initialState = {
  isLogged: false,
  isLoading: true,
  user: {} as UserInfo,
  uid: null as string | null,
  avatar: null as string | null,
  continueWatching: [] as ContinueWatchingItem[],
  listWatching: [] as WatchListGroup[],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (user, uid) => {
        const photoUrl =
          (user.photoUrl as string | undefined) || (user.photoURL as string | undefined) || null;

        setAuthCookie(true);
        set({
          isLogged: true,
          isLoading: false,
          user,
          uid,
          avatar: photoUrl,
        });
      },

      clearSession: () => {
        setAuthCookie(false);
        set({
          isLogged: false,
          isLoading: false,
          user: {},
          uid: null,
          avatar: null,
          continueWatching: [],
          listWatching: [],
        });
      },

      setAvatar: (avatar) => set({ avatar }),

      setContinueWatching: (items) => set({ continueWatching: [...items] }),

      setListWatching: (groups) => set({ listWatching: [...groups] }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isLogged: state.isLogged,
        user: state.user,
        uid: state.uid,
        avatar: state.avatar,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isLogged) {
          setAuthCookie(true);
        }
      },
    }
  )
);

export default useAuthStore;
