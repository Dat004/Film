import { getDatabase, ref, set, get, update, remove, push, onDisconnect, query, orderByChild, limitToLast } from "firebase/database";

export const sha256 = async (message: string) => {
  if (!message) return null;
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

// Initialize Room
export const createRoom = async (host: any, filmId: string, filmData: any, password: string | null = null) => {
  const db = getDatabase();
  const roomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const roomRef = ref(db, `watch_party_rooms/${roomId}`);
  
  const passwordHash = password ? await sha256(password) : null;

  const initData = {
    roomId,
    hostId: host.uid,
    filmId,
    filmData,
    isPrivate: !!password,
    passwordHash,
    status: {
      isPlaying: false,
      currentTime: 0,
      currentEpisode: 0,
    },
    members: {
      [host.uid]: {
        uid: host.uid,
        displayName: host.displayName || "Anonymous",
        photoURL: host.photoURL || "",
        joinedAt: Date.now()
      }
    },
    createdAt: Date.now()
  };

  await set(roomRef, initData);
  return roomId;
};

// Join Room
export const joinRoom = async (roomId: string, user: any, password: string | null = null) => {
  const db = getDatabase();
  const roomRef = ref(db, `watch_party_rooms/${roomId}`);
  
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) {
    throw new Error("Phòng không tồn tại hoặc đã bị giải tán");
  }

  const roomData = snapshot.val();

  // Kiểm tra mật khẩu phòng nếu phòng private và người tham gia không phải là chủ phòng (host)
  if (roomData.isPrivate && roomData.hostId !== user.uid) {
    if (!password) {
      throw new Error("PASSWORD_REQUIRED");
    }
    const inputHash = await sha256(password);
    if (inputHash !== roomData.passwordHash) {
      throw new Error("PASSWORD_INCORRECT");
    }
  }

  const members = roomData.members || {};
  const currentMemberCount = Object.keys(members).length;

  // Ưu tiên người cũ: Nếu chưa có trong danh sách members và số lượng đã đạt tối đa
  if (!members[user.uid] && currentMemberCount >= 20) {
    throw new Error("Phòng đã đầy (tối đa 20 người)");
  }

  const memberRef = ref(db, `watch_party_rooms/${roomId}/members/${user.uid}`);
  const memberData = {
    uid: user.uid,
    displayName: user.displayName || "Anonymous",
    photoURL: user.photoURL || "",
    joinedAt: Date.now()
  };

  const isAlreadyMember = members[user.uid] !== undefined;

  await set(memberRef, memberData);

  if (!isAlreadyMember) {
    await sendSystemMessage(roomId, `${user.displayName || "Ẩn danh"} đã tham gia phòng`);
  }

  // Auto-leave when disconnect
  onDisconnect(ref(db, `watch_party_rooms/${roomId}/members/${user.uid}`)).remove();
};

// Update video status (Only Host calls this)
export const updateVideoSync = async (roomId: string, isPlaying: boolean, currentTime: number, currentEpisode: number = 0) => {
  const db = getDatabase();
  const statusRef = ref(db, `watch_party_rooms/${roomId}/status`);
  await update(statusRef, {
    isPlaying,
    currentTime,
    currentEpisode,
    updatedAt: Date.now()
  });
};

export const sendMessage = async (roomId: string, user: any, text: string) => {
  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: user.uid,
    displayName: user.displayName || "Anonymous",
    text,
    timestamp: Date.now()
  });
};

export const sendReaction = async (roomId: string, user: any, emoji: string) => {
  const db = getDatabase();
  const reactionsRef = ref(db, `watch_party_rooms/${roomId}/reactions`);
  const newReactionRef = push(reactionsRef);
  await set(newReactionRef, {
    uid: user.uid,
    displayName: user.displayName || "Anonymous",
    emoji,
    timestamp: Date.now()
  });

  // Tự động dọn dẹp sau 5 giây để tránh phình dữ liệu
  setTimeout(async () => {
    try {
      await remove(newReactionRef);
    } catch (err) {
      // Bỏ qua nếu phòng đã bị hủy
    }
  }, 5000);
};

export const sendSystemMessage = async (roomId: string, text: string) => {
  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: "system",
    displayName: "Hệ thống",
    text,
    type: "system",
    timestamp: Date.now()
  });
};

export const kickMember = async (roomId: string, targetUserId: string) => {
  const db = getDatabase();
  const snapshot = await get(ref(db, `watch_party_rooms/${roomId}/members/${targetUserId}`));
  let targetName = "Ẩn danh";
  if (snapshot.exists()) {
    targetName = snapshot.val().displayName || "Ẩn danh";
  }
  await remove(ref(db, `watch_party_rooms/${roomId}/members/${targetUserId}`));
  await sendSystemMessage(roomId, `${targetName} đã bị mời ra`);
};

export const transferHost = async (roomId: string, newHostId: string) => {
  const db = getDatabase();
  const snapshot = await get(ref(db, `watch_party_rooms/${roomId}/members/${newHostId}`));
  let newHostName = "Ẩn danh";
  if (snapshot.exists()) {
    newHostName = snapshot.val().displayName || "Ẩn danh";
  }
  await update(ref(db, `watch_party_rooms/${roomId}`), {
    hostId: newHostId
  });
  await sendSystemMessage(roomId, `${newHostName} đã trở thành Chủ phòng mới`);
};

export const destroyRoom = async (roomId: string) => {
  const db = getDatabase();
  await remove(ref(db, `watch_party_rooms/${roomId}`));
};

export const leaveRoom = async (roomId: string, userId: string, isHost: boolean, members: any) => {
  const db = getDatabase();
  
  // Kiểm tra xem phòng có tồn tại không trước khi thực hiện
  const roomSnap = await get(ref(db, `watch_party_rooms/${roomId}`));
  if (!roomSnap.exists()) {
    return;
  }

  const member = members?.[userId] || { displayName: "Ẩn danh" };

  // Xóa user khỏi danh sách members
  await remove(ref(db, `watch_party_rooms/${roomId}/members/${userId}`));

  // Gửi tin nhắn hệ thống thông báo người dùng rời phòng
  await sendSystemMessage(roomId, `${member.displayName} đã rời phòng`);

  // Kiểm tra dọn dẹp phòng trống (Nếu không còn ai trong phòng)
  const remainingCount = members ? Object.values(members).filter((m: any) => m.uid !== userId).length : 0;
  if (remainingCount === 0) {
    // DỌN RÁC DATABASE SAU 3 GIÂY (Giải phóng tài nguyên)
    setTimeout(async () => {
      try {
        const snap = await get(ref(db, `watch_party_rooms/${roomId}/members`));
        if (!snap.exists() || Object.keys(snap.val()).length === 0) {
          await remove(ref(db, `watch_party_rooms/${roomId}`));
        }
      } catch (err) {
        // Bỏ qua nếu có lỗi
      }
    }, 3000);
  }
};

export const getPublicRooms = async () => {
  const db = getDatabase();
  const roomsRef = ref(db, "watch_party_rooms");
  const q = query(roomsRef, orderByChild("createdAt"), limitToLast(20));
  const snapshot = await get(q);
  if (!snapshot.exists()) return [];

  const rooms: any[] = [];
  snapshot.forEach((childSnap) => {
    const room = childSnap.val();
    if (!room.isPrivate) {
      rooms.push({
        ...room,
        roomId: room.roomId || childSnap.key
      });
    }
  });
  return rooms.reverse();
};
