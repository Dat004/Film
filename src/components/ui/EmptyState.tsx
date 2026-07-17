'use client';

import type { LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Optional content rendered below the description. */
  children?: React.ReactNode;
  className?: string;
  descriptionClassName?: string;
}

/** Shared empty state for list screens. */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className,
  descriptionClassName,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-[80px] text-center text-primary',
        className
      )}
    >
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--hover-color)]/12">
        <div
          className="empty-state-ping absolute inset-0 animate-ping rounded-full border-2 border-[var(--hover-color)]/55"
          aria-hidden
        />
        <Icon className="relative z-[1] size-12 text-[var(--hover-color)]" aria-hidden />
      </div>

      <h3 className="mb-2 text-xl font-bold">{title}</h3>

      {description ? (
        <p
          className={cn(
            'max-w-[420px] px-4 text-[15px] leading-relaxed text-secondary whitespace-pre-line',
            children ? 'mb-6' : null,
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}

      {children}
    </div>
  );
};

export default EmptyState;
