import { ChevronLeft, Trash2 } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';

import { ShareLinkButton } from './ShareLinkButton';

interface RoomHeaderProps {
  filmName: string;
  episodeName: string;
  memberCount: number;
  isHost: boolean;
  onLeave: () => void;
  onDestroyRoom: () => void;
  onCopyLink: () => void;
}

export function RoomHeader({
  filmName,
  episodeName,
  memberCount,
  isHost,
  onLeave,
  onDestroyRoom,
  onCopyLink,
}: RoomHeaderProps) {
  return (
    <div className="relative z-[70] flex h-[60px] shrink-0 items-center justify-between border-b border-bd-filed-form-color bg-bg-sidebar px-4">
      <div className="flex min-w-0 items-center">
        <Button
          onClick={onLeave}
          rounded
          className="mr-2 shrink-0 p-2 text-secondary hover:bg-white/5 hover:text-red-400"
          title="Rời phòng"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <section className="min-w-0">
          <p className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-hover ssm:hidden">
            Phòng Xem Chung
          </p>
          <h1 className="max-w-[110px] truncate text-sm font-bold leading-tight text-primary ssm:max-w-[160px] sm:max-w-[300px] md:max-w-[500px]">
            {filmName}
          </h1>
        </section>

        <span className="ml-2 shrink-0 rounded bg-bg-field px-1.5 py-0.5 text-[10px] font-semibold leading-[1rem] text-secondary ssm:ml-4 ssm:text-[11px]">
          {episodeName}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-bd-filed-form-color bg-bg-field px-2 py-1 text-[10px] text-secondary sm:text-xs">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 sm:h-2 sm:w-2" />
          <span className="hidden sm:inline">{memberCount} đang xem</span>
          <span className="sm:hidden">{memberCount}</span>
        </div>

        <ShareLinkButton onCopy={onCopyLink} />

        {isHost && (
          <Button
            onClick={onDestroyRoom}
            rounded
            className="shrink-0 p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            title="Giải tán phòng"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoomHeader;
