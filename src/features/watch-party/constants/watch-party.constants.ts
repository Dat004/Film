export const REACTIONS = ['👍', '❤️', '😂', '🔥', '😮'] as const;

export const DEFAULT_AVATAR_URL =
  'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
export const MAX_MEMBERS = 20;
export const MAX_CHAT_LENGTH = 500;
export const COUNTER_THRESHOLD = 400;
export const SYNC_DEBOUNCE_MS = 500;

/** Must match the grace window in firebase/database.rules.json. */
export const HOST_OFFLINE_GRACE_MS = 15 * 60 * 1000;

/** Interval for stale-room checks while a room is active. */
export const HOST_OFFLINE_RECONCILE_INTERVAL_MS = 60 * 1000;

export const ROOM_LIMITS = {
  maxMembers: 20,
  reactionTimeout: 5000,
} as const;
