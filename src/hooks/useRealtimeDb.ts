'use client';

import { getDatabase, ref, get, set, update, remove, type DataSnapshot } from 'firebase/database';

import { ToastMessage } from '@/components/ui/Toastify';

export interface GetDbParams<T = unknown> {
  path?: string;
  callback?: (snapshot: DataSnapshot) => T | Promise<T>;
  fallback?: (err: unknown) => T;
}

export interface SetDbParams {
  path?: string;
  options?: unknown;
  messageSuccess?: string;
  messageError?: string;
}

export interface UpdateDbParams {
  path?: string;
  options?: Record<string, unknown>;
  messageSuccess?: string;
  messageError?: string;
}

export interface RemoveDbParams {
  path?: string;
}

const useRealtimeDbFirebase = () => {
  const db = getDatabase();

  const getDb = async <T>({
    path = '',
    callback = (snapshot) => snapshot as unknown as T,
    fallback = (err) => {
      throw err;
    },
  }: GetDbParams<T>): Promise<T> => {
    const dbRef = ref(db, path);

    try {
      const snapshot = await get(dbRef);
      return await callback(snapshot);
    } catch (err) {
      return fallback(err);
    }
  };

  const setDb = async ({
    path = '',
    options = {},
    messageSuccess,
    messageError,
  }: SetDbParams): Promise<void> => {
    const dbRef = ref(db, path);

    try {
      await set(dbRef, options);
      if (messageSuccess) {
        ToastMessage.success(messageSuccess);
      }
    } catch (err) {
      if (messageError) {
        ToastMessage.error(messageError);
      }
      throw err;
    }
  };

  const updateDb = async ({
    path = '',
    options = {},
    messageSuccess,
    messageError,
  }: UpdateDbParams): Promise<void> => {
    const dbRef = ref(db, path);

    try {
      await update(dbRef, options);
      if (messageSuccess) {
        ToastMessage.success(messageSuccess);
      }
    } catch (err) {
      if (messageError) {
        ToastMessage.error(messageError);
      }
      throw err;
    }
  };

  const removeDb = async ({ path = '' }: RemoveDbParams): Promise<void> => {
    const dbRef = ref(db, path);
    await remove(dbRef);
  };

  return { getDb, setDb, updateDb, removeDb };
};

export default useRealtimeDbFirebase;
