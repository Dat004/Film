import * as admin from 'firebase-admin';

admin.initializeApp();

export {
  onWatchPartyMemberRemoved,
  onWatchPartyMemberAdded,
  onWatchPartyHostChanged,
  cleanupStaleWatchPartyRooms,
} from './watch-party';
