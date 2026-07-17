'use client';

import React from 'react';

export interface PreviewTrailerMediaProps {
  posterUrl: string;
  trailerId: string | null;
  shouldPlayTrailer: boolean;
  trailerFailed: boolean;
  onIframeLoad: () => void;
}

function buildYoutubeEmbedUrl(trailerId: string): string {
  // Prefer nocookie + explicit origin to reduce embed errors (incl. 153)
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const qs = [
    'autoplay=1',
    'mute=1',
    'controls=0',
    'rel=0',
    'modestbranding=1',
    'playsinline=1',
    'iv_load_policy=3',
    origin ? `origin=${origin}` : '',
  ]
    .filter(Boolean)
    .join('&');
  return `https://www.youtube-nocookie.com/embed/${trailerId}?${qs}`;
}

export default function PreviewTrailerMedia({
  posterUrl,
  trailerId,
  shouldPlayTrailer,
  trailerFailed,
  onIframeLoad,
}: PreviewTrailerMediaProps) {
  return (
    <div className="relative w-full pb-[56%] overflow-hidden bg-fill-secondary">
      {shouldPlayTrailer && trailerId && !trailerFailed ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          title="Trailer"
          src={buildYoutubeEmbedUrl(trailerId)}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          onLoad={onIframeLoad}
        />
      ) : posterUrl ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.75)] via-[rgba(0,0,0,0.15)] to-transparent" />
        </>
      ) : null}
    </div>
  );
}
