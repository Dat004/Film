import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...passProps }, ref) => {
    const containerStyles = cn('bg-bg-sidebar rounded-[4px]', {
      [className || '']: className,
    });

    const handleClickInside = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    };

    return (
      <div ref={ref} onClick={handleClickInside} className={containerStyles} {...passProps}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
