import { getDatabase, ref, set, push, remove } from 'firebase/database';

import { ROOM_LIMITS } from '../constants/watch-party.constants';

import type { UserParam } from './types';

export const sendMessage = async (roomId: string, user: UserParam, text: string): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed) return;

  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    text: trimmed.slice(0, 500),
    timestamp: Date.now(),
  });
};

export const sendReaction = async (
  roomId: string,
  user: UserParam,
  emoji: string
): Promise<void> => {
  const db = getDatabase();
  const reactionsRef = ref(db, `watch_party_rooms/${roomId}/reactions`);
  const newReactionRef = push(reactionsRef);
  await set(newReactionRef, {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    emoji,
    timestamp: Date.now(),
  });

  setTimeout(async () => {
    try {
      await remove(newReactionRef);
    } catch {
      // The room may have been removed before this timer fired.
    }
  }, ROOM_LIMITS.reactionTimeout);
};

/** Writes a member-authorized system message. */
export const sendSystemMessage = async (roomId: string, text: string): Promise<void> => {
  const db = getDatabase();
  const messagesRef = ref(db, `watch_party_rooms/${roomId}/messages`);
  const newMsgRef = push(messagesRef);
  await set(newMsgRef, {
    uid: 'system',
    displayName: 'Hệ thống',
    text,
    type: 'system',
    timestamp: Date.now(),
  });
};
