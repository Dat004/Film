'use client';

import React from 'react';

export default function PreviewSkeleton() {
  return (
    <div className="overflow-hidden">
      <div className="preview-film-skeleton w-full pb-[56%]" />
      <div className="p-[14px] space-y-[10px]">
        <div className="preview-film-skeleton h-[16px] w-[85%] rounded-[4px]" />
        <div className="preview-film-skeleton h-[12px] w-[55%] rounded-[4px]" />
        <div className="flex gap-[6px]">
          <div className="preview-film-skeleton h-[20px] w-[48px] rounded-[5px]" />
          <div className="preview-film-skeleton h-[20px] w-[56px] rounded-[5px]" />
        </div>
        <div className="preview-film-skeleton h-[12px] w-full rounded-[4px]" />
        <div className="preview-film-skeleton h-[12px] w-[90%] rounded-[4px]" />
      </div>
    </div>
  );
}
