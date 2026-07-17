import { Crown, UserMinus } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { MAX_MEMBERS } from '../../constants/watch-party.constants';
import type { UserParam } from '../../services/watch-party.service';
import type { RoomMember } from '../../types/watch-party.types';

import PartyAvatar from './PartyAvatar';

export interface MemberListProps {
  members: RoomMember[];
  isHost: boolean;
  hostId: string;
  user: UserParam;
  onKick?: (memberId: string, displayName?: string) => void;
  onTransferHost?: (memberId: string, displayName?: string) => void;
  /** Compact chips (header) vs full rows (modal) */
  variant?: 'chips' | 'rows';
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  isHost,
  hostId,
  user,
  onKick,
  onTransferHost,
  variant = 'rows',
}) => {
  const sortedMembers = [...members].sort((a, b) => a.joinedAt - b.joinedAt);
  const displayMembers = sortedMembers.slice(0, MAX_MEMBERS);
  const remainingCount = Math.max(0, sortedMembers.length - MAX_MEMBERS);

  if (variant === 'chips') {
    return (
      <div className="mt-3 flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 pb-1">
        {displayMembers.map((m) => (
          <div
            key={m.uid}
            className="flex items-center gap-2 px-2 py-1.5 rounded-full border border-bd-filed-form-color/60 h-9"
          >
            <PartyAvatar src={m.photoURL} alt={m.displayName} size={24} />
            <span
              className={cn(
                'text-[13px] max-w-[110px] truncate',
                m.uid === user.uid ? 'font-bold text-primary' : 'text-secondary font-medium'
              )}
            >
              {m.displayName}
            </span>
            {m.uid === hostId && (
              <Crown className="size-3.5 text-amber-400 shrink-0" aria-label="Chủ phòng" />
            )}
            {m.connected === false && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary/80">
                Offline
              </span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-bg-block h-9">
            <span className="text-xs font-semibold text-secondary">+{remainingCount}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {displayMembers.map((m) => {
        const isSelf = m.uid === user.uid;
        const isRoomHost = m.uid === hostId;
        const canManage = isHost && !isSelf;

        return (
          <li
            key={m.uid}
            className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-bg-menu-items/80 transition-colors"
          >
            <PartyAvatar
              src={m.photoURL}
              alt={m.displayName}
              size={40}
              className="ring-1 ring-bd-filed-form-color"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-[14px] truncate',
                    isSelf ? 'font-semibold text-primary' : 'font-medium text-primary',
                    m.connected === false && 'opacity-60'
                  )}
                >
                  {m.displayName}
                  {isSelf ? ' (Bạn)' : ''}
                </span>
                {isRoomHost && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                    <Crown className="size-3" />
                    Host
                  </span>
                )}
                {m.connected === false && (
                  <span className="inline-flex items-center rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                    Offline
                  </span>
                )}
              </div>
              <p className="text-[11px] text-secondary mt-0.5">
                {m.connected === false ? 'Offline' : isRoomHost ? 'Chủ phòng' : 'Người xem'}
              </p>
            </div>

            {canManage && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onTransferHost?.(m.uid, m.displayName)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-secondary hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  title="Chuyển quyền Host"
                  aria-label={`Chuyển Host cho ${m.displayName}`}
                >
                  <Crown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onKick?.(m.uid, m.displayName)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Mời ra khỏi phòng"
                  aria-label={`Kick ${m.displayName}`}
                >
                  <UserMinus className="size-4" />
                </button>
              </div>
            )}
          </li>
        );
      })}
      {remainingCount > 0 && (
        <li className="px-2.5 py-2 text-xs text-secondary">+{remainingCount} thành viên khác</li>
      )}
    </ul>
  );
};

export default MemberList;
