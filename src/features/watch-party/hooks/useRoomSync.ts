import { getDatabase, ref, onValue, query, limitToLast } from 'firebase/database';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { WatchPartyToast } from '@/components/ui/Toastify';
import { setStatusMovie, setCurrentEpisode, resetEpisode, resetMovie } from '@/features/player';

import { HOST_OFFLINE_RECONCILE_INTERVAL_MS } from '../constants/watch-party.constants';
import { trackWatchPartyEvent } from '../lib/watch-party.telemetry';
import { sortRoomMessages, dedupeSystemMessages } from '../lib/watch-party.utils';
import {
  joinRoom,
  leaveRoom,
  registerRoomDisconnectHandler,
  repairOrphanHost,
  setLobbyMemberCount,
  reconcileStaleWatchPartyRoom,
} from '../services/watch-party.service';
import type { UserParam } from '../services/watch-party.service';
import type { WatchPartyRoom, RoomMessage, RoomMember } from '../types/watch-party.types';

import { useMemberNotifications } from './useMemberNotifications';

const CHAT_MESSAGE_LIMIT = 100;

/** Pending leave operations that may be cancelled by an immediate remount. */
const pendingLeaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

const LEAVE_DEFER_MS = 400;

export function useRoomSync(roomId: string, user: UserParam | null, isLogged: boolean) {
  const [roomData, setRoomData] = useState<WatchPartyRoom | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const uid = user?.uid;
  const isHost = roomData?.hostId === uid;

  const roomDataRef = useRef<WatchPartyRoom | null>(roomData);
  const isHostRef = useRef<boolean>(isHost);
  const userRef = useRef<UserParam | null>(user);
  const roomUnsubRef = useRef<(() => void) | null>(null);
  const chatUnsubRef = useRef<(() => void) | null>(null);
  const lobbySyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const orphanRepairRef = useRef(false);
  const prevHostIdRef = useRef<string | null>(null);

  const { notifyChanges } = useMemberNotifications(uid);

  useEffect(() => {
    roomDataRef.current = roomData;
    isHostRef.current = isHost;
    userRef.current = user;
  }, [roomData, isHost, user]);

  const subscribeToRoom = useCallback(
    (currentUid: string) => {
      const db = getDatabase();
      const roomRef = ref(db, `watch_party_rooms/${roomId}`);

      const roomUnsub = onValue(roomRef, (snapshot) => {
        if (!snapshot.exists()) {
          setError('Phòng chiếu đã bị đóng bởi Chủ Phòng.');
          return;
        }

        const data = snapshot.val() as WatchPartyRoom;

        if (!data.members || !data.members[currentUid]) {
          setError('Phiên xem chung đã kết thúc hoặc bạn đã rời phòng.');
          return;
        }

        notifyChanges(data.members || {});
        setRoomData(data);

        const hostMember = data.hostId ? data.members?.[data.hostId] : undefined;
        if (prevHostIdRef.current && prevHostIdRef.current !== data.hostId && hostMember) {
          const newHostName = hostMember.displayName || 'Ẩn danh';
          WatchPartyToast.hostChanged(newHostName);
        }
        prevHostIdRef.current = data.hostId;

        const memberCount = Object.keys(data.members || {}).length;
        if (lobbySyncTimeoutRef.current) clearTimeout(lobbySyncTimeoutRef.current);
        lobbySyncTimeoutRef.current = setTimeout(() => {
          setLobbyMemberCount(roomId, memberCount).catch(() => undefined);
        }, 500);

        if (data.hostId && data.members && !data.members[data.hostId] && !orphanRepairRef.current) {
          orphanRepairRef.current = true;
          repairOrphanHost(roomId, data.members, data.hostId)
            .catch(() => undefined)
            .finally(() => {
              orphanRepairRef.current = false;
            });
        }

        if (data.hostId !== currentUid && data.status) {
          setStatusMovie({ key: 'isPlay', value: data.status.isPlaying });
          if (data.status.currentEpisode !== undefined) {
            setCurrentEpisode(data.status.currentEpisode);
          }
          if (typeof data.status.playbackRate === 'number') {
            setStatusMovie({ key: 'playbackRate', value: data.status.playbackRate });
          }
          if (typeof data.status.autoPlay === 'boolean') {
            setStatusMovie({ key: 'autoPlay', value: data.status.autoPlay });
          }
          if (typeof data.status.autoNext === 'boolean') {
            setStatusMovie({ key: 'autoNext', value: data.status.autoNext });
          }
        }
      });

      roomUnsubRef.current = roomUnsub;

      const messagesQuery = query(
        ref(db, `watch_party_rooms/${roomId}/messages`),
        limitToLast(CHAT_MESSAGE_LIMIT)
      );

      const chatUnsub = onValue(
        messagesQuery,
        (snapshot) => {
          setChatLoading(false);
          setChatError(null);
          setMessages(
            dedupeSystemMessages(
              sortRoomMessages(
                snapshot.val() as Record<string, RoomMessage> | null,
                CHAT_MESSAGE_LIMIT
              )
            )
          );
        },
        (err) => {
          setChatLoading(false);
          setChatError(err.message || 'Không thể tải tin nhắn');
          trackWatchPartyEvent('chat_error', { roomId, message: err.message });
        }
      );

      chatUnsubRef.current = chatUnsub;
    },
    [roomId, notifyChanges]
  );

  const tryJoin = useCallback(
    async (password: string | null = null) => {
      const currentUser = userRef.current;
      if (!currentUser?.uid) return;

      try {
        setError(null);
        setPasswordError('');
        await joinRoom(roomId, currentUser, password);
        setPasswordRequired(false);
        setIsInitializing(false);
        subscribeToRoom(currentUser.uid);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
        if (message === 'PASSWORD_REQUIRED') {
          setPasswordRequired(true);
          setIsInitializing(false);
        } else if (message === 'PASSWORD_INCORRECT') {
          setPasswordRequired(true);
          setPasswordError('Mật khẩu không chính xác!');
          setIsInitializing(false);
        } else {
          setError(message);
          setIsInitializing(false);
        }
      }
    },
    [roomId, subscribeToRoom]
  );

  useEffect(() => {
    // Cancel a leave scheduled by a Strict Mode or HMR remount.
    const pending = pendingLeaveTimers.get(roomId);
    if (pending) {
      clearTimeout(pending);
      pendingLeaveTimers.delete(roomId);
    }

    if (!isLogged) {
      setError('Vui lòng đăng nhập để tham gia Watch Party');
      return;
    }

    if (!uid) return;

    tryJoin();

    return () => {
      if (lobbySyncTimeoutRef.current) clearTimeout(lobbySyncTimeoutRef.current);
      roomUnsubRef.current?.();
      chatUnsubRef.current?.();
      roomUnsubRef.current = null;
      chatUnsubRef.current = null;

      const currentUser = userRef.current;
      if (!currentUser?.uid) {
        resetEpisode();
        resetMovie();
        return;
      }

      // Defer leaving so an immediate development remount can cancel it.
      const leaveUid = currentUser.uid;
      const leaveHost = isHostRef.current;
      const leaveMembers = roomDataRef.current?.members || null;
      const existing = pendingLeaveTimers.get(roomId);
      if (existing) clearTimeout(existing);

      pendingLeaveTimers.set(
        roomId,
        setTimeout(() => {
          pendingLeaveTimers.delete(roomId);
          leaveRoom(roomId, leaveUid, leaveHost, leaveMembers).catch(() => undefined);
        }, LEAVE_DEFER_MS)
      );

      resetEpisode();
      resetMovie();
    };
  }, [roomId, uid, isLogged, tryJoin]);

  // Refresh presence handlers when membership or host ownership changes.
  useEffect(() => {
    if (!uid || !roomData?.members?.[uid]) return;

    registerRoomDisconnectHandler(roomId, uid, roomData.members, roomData.hostId === uid).catch(
      () => undefined
    );
  }, [roomId, uid, roomData?.hostId, roomData?.members]);

  // Reconcile the room after the host reconnect window expires.
  const hostMember = roomData?.hostId ? roomData.members?.[roomData.hostId] : undefined;
  const hostConnectionKey = hostMember
    ? `${roomData?.hostId}:${hostMember.connected !== false}:${String(hostMember.disconnectedAt ?? '')}`
    : `${roomData?.hostId ?? ''}:missing`;

  useEffect(() => {
    if (!uid || !roomData?.members?.[uid]) return;

    const tick = () => {
      void reconcileStaleWatchPartyRoom(roomId);
    };

    tick();
    const id = setInterval(tick, HOST_OFFLINE_RECONCILE_INTERVAL_MS);
    return () => clearInterval(id);
    // Re-arm only when host presence changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, uid, hostConnectionKey]);

  const members = useMemo((): RoomMember[] => {
    return roomData?.members ? Object.values(roomData.members) : [];
  }, [roomData?.members]);

  const memberMap = useMemo((): Record<string, RoomMember> => {
    if (!roomData?.members) return {};
    return Object.values(roomData.members).reduce<Record<string, RoomMember>>((acc, m) => {
      acc[m.uid] = m;
      return acc;
    }, {});
  }, [roomData?.members]);

  const submitPassword = (password: string) => {
    tryJoin(password);
  };

  return {
    roomData,
    error,
    isInitializing,
    isHost,
    messages,
    chatLoading,
    chatError,
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword,
  };
}

export default useRoomSync;
