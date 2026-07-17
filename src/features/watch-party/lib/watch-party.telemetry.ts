import { logger } from '@/lib/logger';

export type WatchPartyEventName =
  | 'room_create'
  | 'room_join'
  | 'room_join_failed'
  | 'room_leave'
  | 'room_destroy'
  | 'host_transfer'
  | 'member_kick'
  | 'video_sync_error'
  | 'chat_error'
  | 'lobby_count_sync_skipped'
  | 'status_sync_skipped'
  | 'room_stale_cleanup';

export function trackWatchPartyEvent(
  event: WatchPartyEventName,
  payload?: Record<string, unknown>
): void {
  logger.info(`[watch-party] ${event}`, { event, ...payload });
}

export default trackWatchPartyEvent;
