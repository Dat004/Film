'use client';

import React from 'react';

import { cn } from '@/lib/utils';

export interface InfoDisplayItem {
  key: string;
  value: any;
}

export interface InfoDisplayProps {
  data?: InfoDisplayItem[];
  className?: string;
}

const TYPE_LABELS: Record<string, string> = {
  single: 'Phim lẻ',
  series: 'Phim bộ',
  hoathinh: 'Phim hoạt hình',
  tvshows: 'TV shows',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Hoàn thành',
  ongoing: 'Đang phát hành',
};

function formatInfoValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') {
    return TYPE_LABELS[value] ?? STATUS_LABELS[value] ?? value;
  }
  return String(value);
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ data = [], className }) => {
  if (!data.length) return null;

  return (
    <div className={cn('detail-film-meta-col divide-y divide-bd-filed-form-color', className)}>
      {data.map((item, index) => {
        const label = item?.key ?? '';
        const displayValue = formatInfoValue(item?.value);

        return (
          <div
            key={`${label}-${index}`}
            className="flex flex-col gap-[4px] py-[12px] sm:flex-row sm:items-baseline sm:gap-[12px] sm:py-[11px]"
          >
            <span className="shrink-0 text-[12px] font-medium leading-[1.4] text-thirty sm:min-w-[120px]">
              {label}:
            </span>
            <span className="min-w-0 text-[13px] font-semibold leading-[1.45] text-primary whitespace-pre-wrap">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default InfoDisplay;
