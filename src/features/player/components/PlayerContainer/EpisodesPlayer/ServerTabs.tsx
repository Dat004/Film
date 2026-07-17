'use client';

import React from 'react';

import type { Episode } from '@/features/film/types/film.types';
import { cn } from '@/lib/utils';

export interface ServerTabsProps {
  servers: Episode[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const ServerTabs: React.FC<ServerTabsProps> = ({ servers, activeIndex, onChange }) => {
  if (servers.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-[6px] px-[15px] pb-[10px]">
      {servers.map((server, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={`${server.server_name}-${index}`}
            type="button"
            onClick={() => onChange(index)}
            className={cn(
              'rounded-[999px] px-[10px] py-[5px] text-[11px] font-semibold transition-colors',
              isActive
                ? 'bg-[var(--bg-accent-pink)] text-dark'
                : 'bg-black/25 text-primary ring-1 ring-white/10 hover:bg-black/40'
            )}
            title={server.is_ai ? 'AI dub / AI voice' : undefined}
          >
            {server.server_name}
            {server.is_ai ? <span className="ml-[4px] opacity-70">AI</span> : null}
          </button>
        );
      })}
    </div>
  );
};

export default ServerTabs;
