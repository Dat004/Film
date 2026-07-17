'use client';

import { Play, Pause } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface PlayIconCustomProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlay?: boolean;
  widthContainer?: string;
  heightContainer?: string;
  className?: string;
  to?: string;
  primary?: boolean;
  outline?: boolean;
  rounded?: boolean;
  text?: boolean;
}

const PlayIconCustom: React.FC<PlayIconCustomProps> = ({
  className,
  isPlay = false,
  widthContainer = '96px',
  heightContainer = '96px',
  ...props
}) => {
  const iconItemStyles = cn('text-dark', {
    [className || '']: className,
  });

  return (
    <Button
      style={{ width: widthContainer, height: heightContainer }}
      className="bg-bg-green"
      aria-label="play-btn"
      rounded
      {...(props as any)}
    >
      {isPlay ? <Pause className={iconItemStyles} /> : <Play className={iconItemStyles} />}
    </Button>
  );
};

export default PlayIconCustom;
