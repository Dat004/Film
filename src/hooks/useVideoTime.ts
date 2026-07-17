'use client';

import { useMemo } from 'react';

const useVideoTime = (videoTime: number): string => {
  return useMemo(() => {
    const hours = Math.floor(videoTime / 3600);
    const h = hours.toString().padStart(2, '0');
    const m = Math.floor((videoTime % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(videoTime % 60)
      .toString()
      .padStart(2, '0');
    return hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }, [videoTime]);
};

export default useVideoTime;
