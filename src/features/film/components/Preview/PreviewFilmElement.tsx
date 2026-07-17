'use client';

import { Play, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';

import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import ListContainer from '@/components/ui/Container/ListContainer';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import { useAuth, useWatchlistActions, isFilmInWatchList } from '@/features/auth';
import { DotIcon } from '@/icons';
import { extractYoutubeVideoId, resolveFilmImageUrl, stripHtmlToText } from '@/lib/film-detail';
import { pushRoute } from '@/lib/route-navigation';
import { cn } from '@/lib/utils';

import { FILM_UI_COPY } from '../../constants/film-ui.constants';
import { PREVIEW_TRAILER_DELAY_MS } from '../../constants/preview.constants';
import { usePreviewTrailerAutoplay } from '../../hooks/usePreviewTrailerAutoplay';
import { computePreviewPlacement } from '../../lib/preview-placement';
import { usePreviewFilmStore, setShowPreview } from '../../store/preview-film-store';
import type { FilmDetail, PreviewAnchorRect } from '../../types/film.types';
import FilmMetaBadges from '../FilmMetaBadges';
import FilmTagLinks from '../FilmTagLinks';

import PreviewRatings from './PreviewRatings';
import PreviewSkeleton from './PreviewSkeleton';
import PreviewTrailerMedia from './PreviewTrailerMedia';

export interface PreviewFilmElementProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  data?: Partial<FilmDetail>;
  anchorRect?: PreviewAnchorRect | null;
}

const PreviewFilmElement: React.FC<PreviewFilmElementProps> = ({
  className,
  data = {},
  anchorRect = null,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const navigate = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const { listWatching, uid } = useAuth();
  const { removeFromWatchList } = useWatchlistActions(uid);

  const storeAnchor = usePreviewFilmStore((state) => state.anchorRect);
  const anchor = anchorRect ?? storeAnchor;

  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const isPreviewLoading = usePreviewFilmStore((state) => state.isPreviewLoading);
  const isLoading = isPreviewLoading || (!data?._id && !data?.slug);
  const posterUrl = resolveFilmImageUrl(data?.thumb_url || data?.poster_url);
  const description = data?.content ? stripHtmlToText(data.content) : '';
  const metaParts = [data?.year, data?.time, data?.episode_current].filter(Boolean);
  const trailerId = extractYoutubeVideoId(data?.trailer_url || null);

  const trailer = usePreviewTrailerAutoplay(trailerId, PREVIEW_TRAILER_DELAY_MS);

  const isInWatchlist = useMemo(
    () => isFilmInWatchList(listWatching, data?._id),
    [data?._id, listWatching]
  );

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el || !anchor) return;

    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      const next = computePreviewPlacement(anchor, width, height);
      setCoords(next);
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);

    const onViewportChange = () => apply();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [anchor, data?._id, data?.slug, isLoading]);

  const previewClasses = cn(
    'preview-film-card select-none overflow-hidden !bg-[var(--bg-preview-glass)] !rounded-[10px] backdrop-blur-[10px] border border-solid border-[var(--preview-border)] shadow-[var(--preview-shadow)]',
    className
  );

  const handleDirectionPage = () => {
    if (!data?.slug) return;
    setShowPreview(false);
    pushRoute(navigate, `/phim/${data.slug}`);
  };

  const handleRemove = async () => {
    await removeFromWatchList(data?._id);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const handleContainerMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(e);
    trailer.onMouseEnter();
  };

  const handleContainerMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseLeave?.(e);
    trailer.onMouseLeave();
  };

  return (
    <Container
      ref={previewRef}
      className={previewClasses}
      style={{ left: coords.left, top: coords.top }}
      onClick={handleContainerClick}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      {...props}
    >
      {isLoading ? (
        <PreviewSkeleton />
      ) : (
        <div key={data._id || data.slug} className="preview-film-content-in">
          <PreviewTrailerMedia
            posterUrl={posterUrl}
            trailerId={trailerId}
            shouldPlayTrailer={trailer.shouldPlayTrailer}
            trailerFailed={trailer.trailerFailed}
            onIframeLoad={trailer.onIframeLoad}
          />

          <div className="p-[14px]">
            <header>
              <h3 className="text-[15px] leading-[1.3] text-primary font-semibold line-clamp-2">
                {data?.name}
              </h3>
              {data?.origin_name && data.origin_name !== data.name ? (
                <p className="mt-[4px] text-[11px] leading-[1.3] text-title line-clamp-1">
                  {data.origin_name}
                </p>
              ) : null}
            </header>

            {metaParts.length > 0 ? (
              <div className="flex flex-wrap items-center mt-[8px] text-[12px] text-title">
                {metaParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {index > 0 ? (
                      <i className="mx-[5px] opacity-60">
                        <DotIcon />
                      </i>
                    ) : null}
                    <span>{part}</span>
                  </React.Fragment>
                ))}
              </div>
            ) : null}

            <div className="mt-[8px] [&>div]:justify-start">
              <FilmMetaBadges movie={data} />
            </div>

            <PreviewRatings movie={data} />

            {description ? (
              <p className="line-clamp-3 text-[12px] leading-[1.4] text-title whitespace-pre-line mt-[10px]">
                {description}
              </p>
            ) : null}

            {!!data?.category?.length ? (
              <div className="mt-[10px] [&>div]:justify-start">
                <FilmTagLinks categories={data.category.slice(0, 4)} />
              </div>
            ) : null}

            <FlexContainer className="mt-[14px]">
              <FlexItems className="!flex-grow !flex-shrink">
                <Button
                  className="bg-[var(--bg-accent-pink)] w-[100%] gap-x-[8px] py-[8px] rounded-[999px] text-[13px] font-semibold !text-dark"
                  onClick={handleDirectionPage}
                  leftIcon={<Play className="w-[14px] h-[14px]" />}
                >
                  {FILM_UI_COPY.watchNow}
                </Button>
              </FlexItems>
              <FlexItems className="relative !flex-grow-0 !flex-shrink-0 ml-[8px]">
                {isInWatchlist ? (
                  <Button
                    rounded
                    onClick={handleRemove}
                    title={FILM_UI_COPY.removeFromWatchList}
                    className="bg-bg-white p-[6px] !text-dark"
                  >
                    <i className="text-[20px]">
                      <Trash2 />
                    </i>
                  </Button>
                ) : (
                  <ListContainer dataFilm={data}>
                    <Button
                      rounded
                      title={FILM_UI_COPY.addToWatchList}
                      className="bg-bg-field p-[6px] !text-primary outline-none"
                    >
                      <i className="text-[20px]">
                        <Plus />
                      </i>
                    </Button>
                  </ListContainer>
                )}
              </FlexItems>
            </FlexContainer>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PreviewFilmElement;
