import React from 'react';

import { useVideoTime } from '@/hooks';
import { cn } from '@/lib/utils';

export interface CurrentTimeProps {
  className?: string;
  currentTime?: number;
}

const CurrentTime: React.FC<CurrentTimeProps> = ({ className, currentTime = 0 }) => {
  const time = useVideoTime(currentTime);

  const timeClasses = cn('text-[12px] text-title font-medium', {
    [className || '']: className,
  });

  return <p className={timeClasses}>{time}</p>;
};

export default CurrentTime;
