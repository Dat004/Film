export { default as LoginModal } from './components/LoginModal';
export { default as GoogleButtonLogin } from './components/GoogleButtonLogin';
export { default as AuthProvider } from './providers/auth-provider';
export { useAuth } from './hooks/useAuth';
export {
  useWatchlistActions,
  isFilmInWatchList,
  watchListItemPath,
} from './hooks/useWatchlistActions';
export { useAuthStore } from './store/auth-store';
export { loginWithGoogle, logout, updateProfile } from './lib/auth-actions';
export type * from './types/auth.types';
