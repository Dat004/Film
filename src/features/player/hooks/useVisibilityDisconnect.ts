'use client';

import { useEffect } from 'react';

interface VisibilityDisconnectParams {
  isLogged: boolean;
  hasWatchingData: () => boolean;
  hasProgress: () => boolean;
  onDisconnect: () => void;
  enabled?: boolean;
}

/**
 * Listens to the Page Visibility API and calls `onDisconnect` when the
 * page goes hidden and there is unsaved watching progress.
 */
export function useVisibilityDisconnect({
  isLogged,
  hasWatchingData,
  hasProgress,
  onDisconnect,
  enabled = true,
}: VisibilityDisconnectParams) {
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isLogged && hasWatchingData() && hasProgress()) {
        onDisconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged, enabled]);
}

export default useVisibilityDisconnect;
