'use client';

import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getDatabase, ref, onValue, type Query } from 'firebase/database';
import React, { useEffect, useRef } from 'react';

import { useRealtimeDbFirebase } from '@/hooks';
import { logger } from '@/lib/logger';
import { auth } from '@/services/firebase-client';
import type { WatchListItem } from '@/types/api.types';

import { useAuthStore } from '../store/auth-store';
import type { ContinueWatchingItem, UserInfo, WatchListGroup } from '../types/auth.types';

interface ExtendedFirebaseUser extends FirebaseUser {
  reloadUserInfo?: Record<string, unknown>;
}

function handleSubscribeRef(queryRef: Query, callback: (val: unknown) => void) {
  return onValue(queryRef, (snapshot) => {
    callback(snapshot.val());
  });
}

function groupWatchList(val: Record<string, unknown>): WatchListGroup[] {
  const watchListArr: WatchListGroup[] = [];
  const watchListData: Record<string, WatchListItem[]> = {};
  const data = Object.values(val);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item && typeof item === 'object' && 'type' in item) {
      const type = String((item as Record<string, unknown>)['type']);
      if (!watchListData[type]) {
        watchListData[type] = [];
      }
      watchListData[type]!.push(item as WatchListItem);
    }
  }

  for (const key in watchListData) {
    if (Object.prototype.hasOwnProperty.call(watchListData, key)) {
      watchListArr.push({
        title: key,
        data: watchListData[key]!,
      });
    }
  }

  return watchListArr;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getDb, setDb } = useRealtimeDbFirebase();
  const unsubscribesRef = useRef<Array<() => void>>([]);

  const cleanUpSubscriptions = () => {
    unsubscribesRef.current.forEach((unsub) => unsub());
    unsubscribesRef.current = [];
  };

  useEffect(() => {
    const db = getDatabase();
    const {
      setSession,
      clearSession,
      setAvatar,
      setContinueWatching,
      setListWatching,
      setLoading,
    } = useAuthStore.getState();

    setLoading(true);

    const handleAuthStateChange = async (user: FirebaseUser | null) => {
      cleanUpSubscriptions();

      if (user) {
        const extendedUser = user as ExtendedFirebaseUser;
        const currentUser = {
          ...extendedUser.reloadUserInfo,
          phoneNumber: user.phoneNumber,
        } as UserInfo;

        await getDb({
          path: `/users/${user.uid}`,
          callback: async (snapshot) => {
            if (!snapshot?.exists()) {
              await setDb({
                path: `/users/${user.uid}`,
                options: { currentUser },
              });
            }
          },
          fallback: async (err) => {
            logger.error(
              'Firebase user DB init error',
              err instanceof Error ? err : new Error(String(err))
            );
          },
        });

        const usersRef = ref(db, `users/${user.uid}`);
        const unsubscribeUsers = handleSubscribeRef(usersRef, (value) => {
          const val = value as Record<string, Record<string, unknown>> | null;
          const profile = (val?.currentUser ?? {}) as UserInfo;
          const photoUrl =
            (profile.photoUrl as string | undefined) ||
            (profile.photoURL as string | undefined) ||
            '';

          setAvatar(photoUrl || null);
          setSession(profile, user.uid);
        });

        const continueWatchingRef = ref(db, `continue_watching/${user.uid}`);
        const unsubscribeContinueWatching = handleSubscribeRef(continueWatchingRef, (value) => {
          const val = value as Record<string, ContinueWatchingItem> | null;
          if (!val) {
            setContinueWatching([]);
          } else {
            setContinueWatching(Object.values(val) as ContinueWatchingItem[]);
          }
        });

        const listWatchingRef = ref(db, `list_video/${user.uid}`);
        const unsubscribeListWatching = handleSubscribeRef(listWatchingRef, (value) => {
          const val = value as Record<string, unknown> | null;
          if (!val) {
            setListWatching([]);
          } else {
            setListWatching(groupWatchList(val));
          }
        });

        unsubscribesRef.current = [
          unsubscribeUsers,
          unsubscribeContinueWatching,
          unsubscribeListWatching,
        ];
      } else {
        clearSession();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return () => {
      unsubscribe();
      cleanUpSubscriptions();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
