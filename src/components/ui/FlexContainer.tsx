'use client';

import React from 'react';

import { cn } from '@/lib/utils';

export interface FlexContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  isReverseRow?: boolean;
  isReverseCol?: boolean;
  isWrap?: boolean;
}

const FlexContainer: React.FC<FlexContainerProps> = ({
  children,
  className,
  isReverseRow = false,
  isReverseCol = false,
  isWrap = false,
  ...props
}) => {
  const flexContainerStyles = cn('flex gap-y-[40px]', {
    [className || '']: className,
    'flex-wrap': isWrap,
    'flex-row-reverse': isReverseRow,
    'flex-col-reverse': isReverseCol,
  });

  return (
    <div className={flexContainerStyles} {...props}>
      {children}
    </div>
  );
};

export default FlexContainer;
