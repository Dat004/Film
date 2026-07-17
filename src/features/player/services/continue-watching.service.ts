import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onDisconnect,
  type DatabaseReference,
} from 'firebase/database';

import { logger } from '@/lib/logger';

import { CONTINUE_WATCHING_PATH_PREFIX } from '../constants/playback.constants';

export function continueWatchingItemPath(uid: string, filmId: string): string {
  return `${CONTINUE_WATCHING_PATH_PREFIX}/${uid}/${filmId}`;
}

export type ContinueWatchingPayload = Record<string, unknown>;

/** Upserts a continue-watching record in RTDB. */
export async function saveContinueWatchingItem(
  uid: string,
  payload: ContinueWatchingPayload
): Promise<void> {
  const id = payload._id as string | undefined;
  if (!uid || !id) return;

  const path = continueWatchingItemPath(uid, id);
  const db = getDatabase();
  const dbRef = ref(db, path);

  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      await update(dbRef, { ...payload });
    } else {
      await set(dbRef, payload);
    }
  } catch (err) {
    logger.error(
      'Firebase player data fallback error',
      err instanceof Error ? err : new Error(String(err))
    );
  }
}

/** Persists the latest progress when the client disconnects. */
export function setupContinueWatchingOnDisconnect(
  uid: string,
  payload: ContinueWatchingPayload,
  mode: 'updateWatching' | 'setFull'
): void {
  const id = payload._id as string | undefined;
  if (!uid || !id) return;

  const db = getDatabase();
  const dbRef: DatabaseReference = ref(db, continueWatchingItemPath(uid, id));

  if (mode === 'updateWatching' && payload.watching) {
    void onDisconnect(dbRef).update({ watching: payload.watching });
  } else {
    void onDisconnect(dbRef).set({ ...payload });
  }
}
