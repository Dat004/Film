'use client';

import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import images from '@/assets/images';
import { resolveFilmImageUrl } from '@/lib/film-detail';

import { buildBannerYoutubeEmbedUrl, type BannerTransitionMode } from '../lib/banner-media';
import type { Film } from '../types/film.types';

export interface BannerMediaProps {
  data?: Partial<Film>;
  baseUrl?: string;
  isActive?: boolean;
  trailerId?: string | null;
  shouldPlayTrailer?: boolean;
  trailerFailed?: boolean;
  onTrailerIframeLoad?: () => void;
  transitionMode?: BannerTransitionMode;
}

const BannerMedia: React.FC<BannerMediaProps> = ({
  data = {},
  baseUrl = '',
  isActive = false,
  trailerId = null,
  shouldPlayTrailer = false,
  trailerFailed = false,
  onTrailerIframeLoad,
  transitionMode = 'crossfade-parallax',
}) => {
  const thumbUrl =
    resolveFilmImageUrl(data?.thumb_url, baseUrl) || resolveFilmImageUrl(data?.poster_url, baseUrl);

  const isPlayingTrailer = isActive && shouldPlayTrailer && Boolean(trailerId) && !trailerFailed;

  return (
    <div className="group/banner-media relative h-full w-full overflow-hidden">
      <div className="relative h-full min-h-[360px] mdm:min-h-0 mdm:pb-[56.25%]">
        <div className="absolute inset-0 mdm:inset-0 overflow-hidden">
          <div
            className={`banner-media-parallax absolute inset-[-3%] ${
              isPlayingTrailer ? 'pointer-events-none opacity-0' : 'opacity-100'
            } ${isActive && !isPlayingTrailer ? 'is-active' : ''} ${
              transitionMode === 'depth-dissolve' ? 'is-depth' : ''
            }`}
          >
            <LazyLoadImage
              placeholderSrc={images.imgLoadingVertical?.src || images.imgLoadingVertical}
              className="absolute inset-0 h-full w-full object-cover pointer-events-none"
              alt={data?.name}
              src={thumbUrl}
              height="100%"
              width="100%"
              effect="opacity"
              visibleByDefault
              threshold={0}
            />
          </div>

          {isPlayingTrailer && trailerId ? (
            <iframe
              className="absolute inset-0 z-[1] h-full w-full object-cover pointer-events-none"
              title="Trailer"
              src={buildBannerYoutubeEmbedUrl(trailerId)}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              tabIndex={-1}
              onLoad={onTrailerIframeLoad}
            />
          ) : null}

          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-transparent via-black/10 to-black/55 pointer-events-none mdm:hidden" />
          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[rgba(0,0,0,0.35)] to-transparent pointer-events-none hidden mdm:block" />
        </div>
      </div>
    </div>
  );
};

export default BannerMedia;
