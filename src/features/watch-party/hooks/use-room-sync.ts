"use client";

import * as React from "react";
import { ref, onValue } from "firebase/database";
import { toast } from "sonner";

import { database } from "@/lib/firebase";
import { joinRoom, leaveRoom } from "@/features/watch-party/services/watch-party-service";
import { usePlayerStore } from "@/features/player/stores/player-store";

export interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  photoUrl?: string;
  role?: string;
  joinedAt?: number;
}

export function useRoomSync(roomId: string, user: any, isLoggedIn: boolean) {
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);
  const setCurrentEpisode = usePlayerStore((state) => state.setCurrentEpisode);
  const resetEpisode = usePlayerStore((state) => state.resetEpisode);
  const resetMovie = usePlayerStore((state) => state.resetMovie);

  const [roomData, setRoomData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // States for Room Password
  const [passwordRequired, setPasswordRequired] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState("");

  const isHost = roomData?.hostId === user?.uid;

  const roomDataRef = React.useRef(roomData);
  const isHostRef = React.useRef(isHost);
  const unsubscribeRef = React.useRef<(() => void) | null>(null);
  const prevMembersRef = React.useRef<Record<string, Member> | null>(null);

  React.useEffect(() => {
    roomDataRef.current = roomData;
    isHostRef.current = isHost;
  }, [roomData, isHost]);

  const tryJoin = React.useCallback(async (password: string | null = null) => {
    if (!user || !user.uid) return;
    try {
      setError(null);
      setPasswordError("");
      await joinRoom(roomId, user, password as string | null);
      setPasswordRequired(false);
      setIsInitializing(false);

      const roomRef = ref(database, `watch_party_rooms/${roomId}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          if (!data.members || !data.members[user.uid]) {
            setError("Phiên xem chung đã kết thúc hoặc bạn đã rời phòng.");
            return;
          }

          // Toast Notification when a user joins/leaves
          const currentMembersMap = data.members || {};
          if (prevMembersRef.current) {
            // Check joiners
            Object.keys(currentMembersMap).forEach((mId) => {
              if (mId !== user.uid && !prevMembersRef.current![mId]) {
                toast(`👋 ${currentMembersMap[mId].displayName || "Ẩn danh"} đã vào phòng`);
              }
            });
            // Check leavers
            Object.keys(prevMembersRef.current).forEach((mId) => {
              if (mId !== user.uid && !currentMembersMap[mId]) {
                toast(`👋 ${prevMembersRef.current![mId].displayName || "Ẩn danh"} đã rời phòng`);
              }
            });
          }
          prevMembersRef.current = currentMembersMap;

          setRoomData(data);

          if (data.hostId !== user.uid && data.status) {
            setIsPlay(data.status.isPlaying);
            if (data.status.currentEpisode !== undefined) {
              setCurrentEpisode(data.status.currentEpisode);
            }
          }
        } else {
          setError("Phòng chiếu đã bị đóng bởi Chủ Phòng.");
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      if (err.message === "PASSWORD_REQUIRED") {
        setPasswordRequired(true);
        setIsInitializing(false);
      } else if (err.message === "PASSWORD_INCORRECT") {
        setPasswordRequired(true);
        setPasswordError("Mật khẩu không chính xác!");
        setIsInitializing(false);
      } else {
        setError(err.message || "Không thể kết nối tới phòng.");
        setIsInitializing(false);
      }
    }
  }, [roomId, user, setIsPlay, setCurrentEpisode]);

  React.useEffect(() => {
    if (!isLoggedIn) {
      setError("Vui lòng đăng nhập để tham gia Watch Party");
      return;
    }

    if (!user || !user.uid) {
      return; // Waiting for Firebase Auth session to load
    }

    tryJoin();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      leaveRoom(roomId, user.uid, isHostRef.current, roomDataRef.current?.members);
      resetEpisode();
      resetMovie();
    };
  }, [roomId, user, isLoggedIn, tryJoin, resetEpisode, resetMovie]);

  const messages = React.useMemo(() => {
    return roomData?.messages ? Object.values(roomData.messages) : [];
  }, [roomData?.messages]);

  const members = React.useMemo(() => {
    return roomData?.members ? Object.values(roomData.members) : [];
  }, [roomData?.members]) as Member[];

  const memberMap = React.useMemo(() => {
    if (!roomData?.members) return {};
    return Object.values(roomData.members).reduce((acc: Record<string, Member>, m: any) => {
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
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword,
  };
}

export default useRoomSync;
