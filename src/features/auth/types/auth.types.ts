import type { ContinueWatchingItem, WatchListGroup } from '@/types/api.types';

export type { ContinueWatchingItem, WatchListGroup };

export interface UserInfo {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
  photoURL?: string | null;
  createdAt?: string;
  emailVerified?: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  isLogged: boolean;
  isLoading: boolean;
  user: UserInfo;
  uid: string | null;
  avatar: string | null;
  continueWatching: ContinueWatchingItem[];
  listWatching: WatchListGroup[];

  setSession: (user: UserInfo, uid: string) => void;
  clearSession: () => void;
  setAvatar: (avatar: string | null) => void;
  setContinueWatching: (items: ContinueWatchingItem[]) => void;
  setListWatching: (groups: WatchListGroup[]) => void;
  setLoading: (loading: boolean) => void;
}

export type PersistedAuthState = Pick<AuthState, 'isLogged' | 'user' | 'uid' | 'avatar'>;
