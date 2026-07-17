import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export interface ScreenDimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  isShow?: boolean;
  /** Default above most UI; watch-party uses a lower layer so the player stays visible */
  zIndexClassName?: string;
}

const ScreenDimmer: React.FC<ScreenDimmerProps> = ({
  isShow = false,
  zIndexClassName = 'z-[1001]',
  className,
  ...props
}) => {
  if (typeof window === 'undefined' || !isShow) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 bg-bg-dimmer backdrop-blur-[3px] transition-opacity duration-200 ease-out',
        zIndexClassName,
        className
      )}
      {...props}
    />,
    document.body
  );
};

export default ScreenDimmer;
