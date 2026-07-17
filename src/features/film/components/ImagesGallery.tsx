'use client';

import React, { useMemo, useState } from 'react';

export interface ImagesGalleryProps {
  backdrops?: string[];
  posters?: string[];
  isLoading?: boolean;
}

function ImageTile({
  url,
  aspect,
  onClick,
}: {
  url: string;
  aspect: 'backdrop' | 'poster';
  onClick: () => void;
}) {
  // Use a shorter ratio in narrow columns.
  const ratioClass = aspect === 'poster' ? 'pb-[120%]' : 'pb-[56.25%]';
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden rounded-[10px] ring-1 ring-bd-filed-form-color bg-bg-sidebar hover:ring-primary/30 transition-colors"
      aria-label="Xem ảnh"
    >
      <div className={`relative w-full ${ratioClass}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Ảnh phim"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </button>
  );
}

const ImagesGallery: React.FC<ImagesGalleryProps> = ({
  backdrops = [],
  posters = [],
  isLoading = false,
}) => {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  const backdropItems = useMemo(
    () => backdrops.slice(0, 12).map((url) => ({ url, aspect: 'backdrop' as const })),
    [backdrops]
  );

  const posterItems = useMemo(
    () => posters.slice(0, 8).map((url) => ({ url, aspect: 'poster' as const })),
    [posters]
  );

  if (isLoading) {
    return (
      <div className="mt-[20px] rounded-[10px] border border-bd-filed-form-color bg-bg-sidebar/60 p-[16px]">
        <h3 className="text-[14px] font-semibold text-primary mb-[14px]">Hình ảnh</h3>
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 gap-[10px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[10px] bg-fill-secondary animate-pulse pb-[56.25%]" />
          ))}
        </div>
      </div>
    );
  }

  const totalCount = backdropItems.length + posterItems.length;
  if (totalCount === 0) return null;

  return (
    <div className="mt-[20px] rounded-[10px] border border-bd-filed-form-color bg-bg-sidebar/60 p-[16px]">
      <div className="flex items-center justify-between gap-[12px] mb-[14px]">
        <h3 className="text-[14px] font-semibold text-primary">Hình ảnh</h3>
        <span className="text-[12px] text-secondary">{totalCount} ảnh</span>
      </div>

      {backdropItems.length > 0 ? (
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 player3col:grid-cols-4 gap-[10px]">
          {backdropItems.map((it, idx) => (
            <ImageTile
              key={`backdrop-${idx}-${it.url}`}
              url={it.url}
              aspect={it.aspect}
              onClick={() => setActiveUrl(it.url)}
            />
          ))}
        </div>
      ) : null}

      {posterItems.length > 0 ? (
        <div className="mt-[12px] flex gap-[10px] overflow-x-auto pb-[4px] -mx-[4px] px-[4px]">
          {posterItems.map((it, idx) => (
            <div key={`poster-${idx}-${it.url}`} className="w-[120px] shrink-0">
              <ImageTile url={it.url} aspect={it.aspect} onClick={() => setActiveUrl(it.url)} />
            </div>
          ))}
        </div>
      ) : null}

      {activeUrl ? (
        <div
          className="fixed inset-0 z-[2000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-[16px]"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveUrl(null)}
        >
          <div className="relative max-w-[1100px] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveUrl(null)}
              className="absolute -top-[44px] right-0 rounded-[8px] bg-black/60 px-[12px] py-[8px] text-[12px] font-semibold text-white hover:bg-black/75"
            >
              Đóng
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl}
              alt="Ảnh phim"
              className="w-full h-auto max-h-[80vh] object-contain rounded-[12px] ring-1 ring-white/10 bg-black"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImagesGallery;
