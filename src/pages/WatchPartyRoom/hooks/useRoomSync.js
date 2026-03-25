import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getDatabase, ref, onValue } from "firebase/database";
import { joinRoom, leaveRoom } from "../../../services/firebase/watchPartyService";
import { setStatusMovie, setCurrentEpisode, resetEpisode, resetMovie } from "../../../redux/slices/videoPlayerSlice";
import { ToastMessage } from "../../../components/Toastify";

export function useRoomSync(roomId, user, lg) {
  const dispatch = useDispatch();
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // States cho Room Password
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const isHost = roomData?.hostId === user?.uid;

  const roomDataRef = useRef(roomData);
  const isHostRef = useRef(isHost);
  const unsubscribeRef = useRef(null);
  const prevMembersRef = useRef(null);

  useEffect(() => {
    roomDataRef.current = roomData;
    isHostRef.current = isHost;
  }, [roomData, isHost]);

  const tryJoin = useCallback(async (password = null) => {
    try {
      setError(null);
      setPasswordError("");
      await joinRoom(roomId, user, password);
      setPasswordRequired(false);
      setIsInitializing(false);

      const db = getDatabase();
      const roomRef = ref(db, `watch_party_rooms/${roomId}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          if (!data.members || !data.members[user.uid]) {
             setError("Phiên xem chung đã kết thúc hoặc bạn đã rời phòng.");
             return; 
          }

          // T4.5: Toast Notification khi có người join/leave
          const currentMembersMap = data.members || {};
          if (prevMembersRef.current) {
            // Check joiners
            Object.keys(currentMembersMap).forEach((mId) => {
              if (mId !== user.uid && !prevMembersRef.current[mId]) {
                ToastMessage.info(`👋 ${currentMembersMap[mId].displayName || "Ẩn danh"} đã vào phòng`);
              }
            });
            // Check leavers
            Object.keys(prevMembersRef.current).forEach((mId) => {
              if (mId !== user.uid && !currentMembersMap[mId]) {
                ToastMessage.info(`👋 ${prevMembersRef.current[mId].displayName || "Ẩn danh"} đã rời phòng`);
              }
            });
          }
          prevMembersRef.current = currentMembersMap;

          setRoomData(data);
          
          if (data.hostId !== user.uid && data.status) {
            dispatch(setStatusMovie({ key: "isPlay", value: data.status.isPlaying }));
            if (data.status.currentEpisode !== undefined) {
              dispatch(setCurrentEpisode(data.status.currentEpisode));
            }
          }
        } else {
          setError("Phòng chiếu đã bị đóng bởi Chủ Phòng.");
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      if (err.message === "PASSWORD_REQUIRED") {
        setPasswordRequired(true);
        setIsInitializing(false);
      } else if (err.message === "PASSWORD_INCORRECT") {
        setPasswordRequired(true);
        setPasswordError("Mật khẩu không chính xác!");
        setIsInitializing(false);
      } else {
        setError(err.message);
        setIsInitializing(false);
      }
    }
  }, [roomId, user, dispatch]);

  useEffect(() => {
    if (!lg) {
      setError("Vui lòng đăng nhập để tham gia Watch Party");
      return;
    }

    if (!user || !user.uid) {
      return; // Đang chờ Firebase Auth load session
    }

    tryJoin();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      leaveRoom(roomId, user.uid, isHostRef.current, roomDataRef.current?.members);
      dispatch(resetEpisode());
      dispatch(resetMovie());
    };
  }, [roomId, user, lg, dispatch, tryJoin]);

  const messages = useMemo(() => {
    return roomData?.messages ? Object.values(roomData.messages) : [];
  }, [roomData?.messages]);

  const members = useMemo(() => {
    return roomData?.members ? Object.values(roomData.members) : [];
  }, [roomData?.members]);

  const memberMap = useMemo(() => {
    if (!roomData?.members) return {};
    return Object.values(roomData.members).reduce((acc, m) => {
      acc[m.uid] = m;
      return acc;
    }, {});
  }, [roomData?.members]);

  const submitPassword = (password) => {
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
