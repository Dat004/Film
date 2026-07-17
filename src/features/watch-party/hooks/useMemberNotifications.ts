import { useRef, useCallback } from 'react';

import { WatchPartyToast } from '@/components/ui/Toastify';

import type { RoomMember } from '../types/watch-party.types';

/**
 * Compares the current member map against a snapshot of the previous one
 * and fires toast notifications for join/leave events.
 */
export function useMemberNotifications(currentUserId: string | undefined) {
  const prevMembersRef = useRef<Record<string, RoomMember> | null>(null);
  const currentUserIdRef = useRef<string | undefined>(currentUserId);

  currentUserIdRef.current = currentUserId;

  const notifyChanges = useCallback((currentMembersMap: Record<string, RoomMember>) => {
    const uid = currentUserIdRef.current;

    if (!prevMembersRef.current) {
      prevMembersRef.current = currentMembersMap;
      return;
    }

    Object.keys(currentMembersMap).forEach((mId) => {
      if (mId !== uid && !prevMembersRef.current?.[mId]) {
        WatchPartyToast.memberJoined(currentMembersMap[mId]?.displayName);
      }
    });

    Object.keys(prevMembersRef.current).forEach((mId) => {
      if (mId !== uid && !currentMembersMap[mId]) {
        WatchPartyToast.memberLeft(prevMembersRef.current?.[mId]?.displayName);
      }
    });

    prevMembersRef.current = currentMembersMap;
  }, []);

  return { notifyChanges };
}

export default useMemberNotifications;
