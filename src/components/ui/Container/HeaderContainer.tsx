import React from 'react';

import { cn } from '@/lib/utils';

import Button from '../Button';

export interface HeaderContainerProps {
  className?: string | undefined;
  title?: string | undefined;
  to?: string | undefined;
  isShowAll?: boolean | undefined;
}

export const HeaderContainer: React.FC<HeaderContainerProps> = ({
  className,
  title = '',
  to = '',
  isShowAll = false,
}: HeaderContainerProps) => {
  const headerStyles = cn('flex items-center mb-[16px]', {
    [className || '']: className,
  });

  return (
    <div className={headerStyles}>
      <h3 className="text-[24px] mdm:text-[20px] capitalize text-primary font-semibold">{title}</h3>
      {isShowAll && (
        <div className="ml-auto">
          <Button className="text-[14px] mdm:text-[12px]" to={to}>
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );
};

export default HeaderContainer;
