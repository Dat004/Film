'use client';

import React from 'react';

import { cn } from '@/lib/utils';

export interface FlexItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const FlexItems: React.FC<FlexItemsProps> = ({ children, className, ...props }) => {
  const flexItemsStyles = cn('relative flex-grow-1 flex-shrink-0', {
    [className || '']: className,
  });

  return (
    <div className={flexItemsStyles} {...props}>
      {children}
    </div>
  );
};

export default FlexItems;
