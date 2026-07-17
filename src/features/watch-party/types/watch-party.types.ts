export interface RoomStatus {
  isPlaying: boolean;
  currentTime: number;
  currentEpisode: number;
  /** Host playback preferences synchronized to guests. */
  playbackRate?: number;
  autoPlay?: boolean;
  autoNext?: boolean;
  /** Monotonic marker for explicit host seeks. */
  seekSeq?: number;
  updatedAt?: number;
}

export interface RoomMember {
  uid: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
  /** False while the member is temporarily disconnected. */
  connected?: boolean;
  disconnectedAt?: number | object | null;
}

export interface RoomMessage {
  id?: string;
  uid: string;
  displayName: string;
  text: string;
  type?: 'system';
  timestamp: number;
}

export interface RoomReaction {
  uid: string;
  displayName: string;
  emoji: string;
  timestamp: number;
}

/** Public metadata used by the lobby list. */
export interface WatchPartyLobbyEntry {
  roomId: string;
  hostId: string;
  /** Original room creator. */
  creatorId?: string;
  filmId: string;
  filmName: string;
  posterUrl: string;
  categoryName?: string;
  isPrivate: boolean;
  createdAt: number;
  memberCount: number;
  hostName: string;
  hostPhoto: string;
  /** False while the host is within the reconnect grace period. */
  hostConnected?: boolean;
  /** Host disconnect time in epoch milliseconds. */
  hostDisconnectedAt?: number | null;
}

export interface WatchPartyFilmMeta {
  name: string;
  posterUrl: string;
  categoryName?: string;
}

export interface WatchPartyRoom {
  roomId: string;
  hostId: string;
  /** Original creator, used for host recovery. */
  creatorId?: string;
  filmId: string;
  /** @deprecated Fetch film data by filmId instead. */
  filmData?: Record<string, unknown>;
  isPrivate: boolean;
  passwordHash: string | null;
  status: RoomStatus;
  members: Record<string, RoomMember>;
  createdAt: number;
  messages?: Record<string, RoomMessage>;
  reactions?: Record<string, RoomReaction>;
}
