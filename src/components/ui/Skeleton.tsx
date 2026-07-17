import React from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import Skeleton, { type SkeletonProps } from 'react-loading-skeleton';

import { cn } from '@/lib/utils';
import 'react-loading-skeleton/dist/skeleton.css';

export interface SkeletonContainerProps extends SkeletonProps {
  children?: React.ReactNode;
  baseColor?: string;
  highlightColor?: string;
  className?: string;
}

const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  children,
  baseColor = 'var(--skeleton-base)',
  highlightColor = 'var(--skeleton-highlight)',
  className,
  ...props
}) => {
  const catalogSkeletonClasses = cn('w-[100%] h-[100%] block', {
    [className || '']: className,
  });

  return (
    <SkeletonTheme inline baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton className={catalogSkeletonClasses} {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonContainer;
