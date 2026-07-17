'use client';

import { Plus, Trash2 } from 'lucide-react';
import React, { useState, useLayoutEffect } from 'react';

import ListContainer from '@/components/ui/Container/ListContainer';
import { useAuth } from '@/features/auth';
import { useVideoPlayerStore } from '@/features/player';
import { useRealtimeDbFirebase } from '@/hooks';
import { cn } from '@/lib/utils';

import Button from './Button';

export interface WatchListButtonProps {
  right?: boolean;
  top?: boolean;
  compact?: boolean;
  menuItem?: boolean;
  /** Toolbar icon-only (BarPlayer) */
  iconOnly?: boolean;
}

const WatchListButton: React.FC<WatchListButtonProps> = ({
  compact = false,
  menuItem = false,
  iconOnly = false,
}) => {
  const [isAlreadyWatchList, setIsAlreadyWatchList] = useState(false);

  const { removeDb } = useRealtimeDbFirebase();
  const movieData = useVideoPlayerStore((state) => state.movie.movieData);
  const { listWatching, uid } = useAuth();

  useLayoutEffect(() => {
    const isAlready = (listWatching || []).some((watch: any) =>
      watch.data?.find((value: any) => value?._id === movieData?._id)
    );

    setIsAlreadyWatchList(isAlready);
  }, [movieData, listWatching]);

  const handleRemoveVideoToList = async () => {
    const dbRef = `/list_video/${uid}/${movieData?._id}`;

    await removeDb({
      path: dbRef,
    });
  };

  if (iconOnly) {
    const iconBtn = cn(
      'inline-flex size-[40px] shrink-0 items-center justify-center rounded-[10px]',
      'text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white/90',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
    );

    if (isAlreadyWatchList) {
      return (
        <button
          type="button"
          className={iconBtn}
          onClick={handleRemoveVideoToList}
          title="Xóa khỏi danh sách phát"
          aria-label="Xóa khỏi danh sách"
        >
          <Trash2 className="size-[17px]" strokeWidth={1.75} />
        </button>
      );
    }

    return (
      <ListContainer dataFilm={movieData}>
        <button
          type="button"
          className={iconBtn}
          title="Thêm vào danh sách phát"
          aria-label="Thêm vào danh sách"
        >
          <Plus className="size-[17px]" strokeWidth={1.75} />
        </button>
      </ListContainer>
    );
  }

  if (menuItem) {
    const menuBtnClass = cn(
      'flex w-full items-center gap-x-[12px] rounded-[10px] px-[10px] py-[10px]',
      'text-left text-[13px] font-medium text-white/85',
      'hover:bg-white/[0.05]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'
    );

    if (isAlreadyWatchList) {
      return (
        <button
          type="button"
          className={menuBtnClass}
          onClick={handleRemoveVideoToList}
          title="Xóa khỏi danh sách phát"
          aria-label="Xóa khỏi danh sách"
        >
          <Trash2 className="size-[16px] shrink-0 text-white/45" strokeWidth={1.75} />
          Xóa khỏi list
        </button>
      );
    }

    return (
      <ListContainer dataFilm={movieData}>
        <button
          type="button"
          className={menuBtnClass}
          title="Thêm vào danh sách phát"
          aria-label="Thêm vào danh sách"
        >
          <Plus className="size-[16px] shrink-0 text-white/45" strokeWidth={1.75} />
          Thêm
        </button>
      </ListContainer>
    );
  }

  const label = isAlreadyWatchList
    ? compact
      ? 'Xóa khỏi list'
      : 'Remove from list'
    : compact
      ? 'Thêm'
      : 'Add to list';

  const btnClass = cn(
    'inline-flex h-[34px] items-center gap-x-[6px] text-[12px] font-medium text-primary transition-colors hover:bg-white/12',
    compact && 'justify-center'
  );

  if (isAlreadyWatchList) {
    return (
      <Button
        aria-label="Xóa khỏi danh sách"
        className={btnClass}
        onClick={handleRemoveVideoToList}
        title="Xóa khỏi danh sách phát"
      >
        <Trash2 className="size-[15px] shrink-0 text-white/55" />
        {label}
      </Button>
    );
  }

  return (
    <ListContainer dataFilm={movieData}>
      <Button aria-label="Thêm vào danh sách" className={btnClass} title="Thêm vào danh sách phát">
        <Plus className="size-[15px] shrink-0 text-white/55" />
        {label}
      </Button>
    </ListContainer>
  );
};

export default WatchListButton;
