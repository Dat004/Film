import { getDatabase, ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { useState, useEffect, useRef } from 'react';

import { reconcileStaleLobbyRooms } from '../services/watch-party.service';
import type { WatchPartyLobbyEntry } from '../types/watch-party.types';

export function useWatchPartyLobby() {
  const [rooms, setRooms] = useState<WatchPartyLobbyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cleanupKeyRef = useRef<string>('');

  useEffect(() => {
    const db = getDatabase();
    const lobbyRef = query(
      ref(db, 'watch_party_lobby'),
      orderByChild('createdAt'),
      limitToLast(20)
    );

    const unsubscribe = onValue(
      lobbyRef,
      (snapshot) => {
        setLoading(false);
        setError(null);

        if (!snapshot.exists()) {
          setRooms([]);
          return;
        }

        const entries: WatchPartyLobbyEntry[] = [];
        snapshot.forEach((childSnap) => {
          const entry = childSnap.val() as WatchPartyLobbyEntry;
          if (!entry.isPrivate) {
            entries.push({
              ...entry,
              roomId: entry.roomId || childSnap.key || '',
            });
          }
        });

        const next = entries.reverse();
        setRooms(next);

        // Reconcile stale rooms when the lobby receives fresh data.
        const cleanupKey = next
          .filter((r) => r.hostConnected === false)
          .map((r) => `${r.roomId}:${r.hostDisconnectedAt ?? 0}`)
          .join('|');
        if (cleanupKey && cleanupKey !== cleanupKeyRef.current) {
          cleanupKeyRef.current = cleanupKey;
          void reconcileStaleLobbyRooms(next);
        }
      },
      (err) => {
        setLoading(false);
        setError(err.message || 'Không thể tải danh sách phòng');
      }
    );

    return () => unsubscribe();
  }, []);

  return { rooms, loading, error };
}

export default useWatchPartyLobby;
