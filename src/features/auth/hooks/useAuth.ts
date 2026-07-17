'use client';

import { useShallow } from 'zustand/react/shallow';

import { loginWithGoogle, logout, updateProfile } from '../lib/auth-actions';
import { useAuthStore } from '../store/auth-store';

export function useAuth() {
  const state = useAuthStore(
    useShallow((s) => ({
      isLogged: s.isLogged,
      isLoading: s.isLoading,
      user: s.user,
      uid: s.uid,
      avatar: s.avatar,
      continueWatching: s.continueWatching,
      listWatching: s.listWatching,
    }))
  );

  return {
    ...state,
    loginWithGoogle,
    logout,
    updateProfile,
  };
}
