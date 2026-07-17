'use client';

import { Play, Star } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import { DotIcon } from '@/icons';
import { stripHtmlToText } from '@/lib/film-detail';

import { BANNER_EXIT_MS } from '../constants/banner.constants';
import { FILM_UI_COPY } from '../constants/film-ui.constants';
import type { Film, FilmDetail } from '../types/film.types';

export interface BannerInfoProps {
  data?: Partial<Film>;
  detail?: Partial<FilmDetail> | null;
  trailerId?: string | null;
  /** Changes with the active slide to restart its animation. */
  transitionKey?: string;
  /** Slide direction used by the information-column parallax. */
  slideDir?: 'next' | 'prev';
}

const EXIT_MS = BANNER_EXIT_MS;

type InfoSnapshot = {
  key: string;
  data: Partial<Film>;
  detail: Partial<FilmDetail> | null;
  trailerId: string | null;
};

const BannerInfo: React.FC<BannerInfoProps> = ({
  data = {},
  detail = null,
  trailerId = null,
  transitionKey = '',
  slideDir = 'next',
}) => {
  const [snapshot, setSnapshot] = useState<InfoSnapshot>({
    key: transitionKey,
    data,
    detail,
    trailerId,
  });
  const [visible, setVisible] = useState(true);
  const propsRef = useRef({ data, detail, trailerId });
  propsRef.current = { data, detail, trailerId };
  const enterFrom = slideDir === 'prev' ? '-translate-x-[14px]' : 'translate-x-[14px]';

  useEffect(() => {
    if (!transitionKey || transitionKey === snapshot.key) {
      setSnapshot((prev) => (prev.key === transitionKey ? { ...prev, ...propsRef.current } : prev));
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setSnapshot({ key: transitionKey, ...propsRef.current });
      requestAnimationFrame(() => setVisible(true));
    }, EXIT_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  useEffect(() => {
    if (transitionKey !== snapshot.key) return;
    setSnapshot((prev) => ({ ...prev, ...propsRef.current }));
  }, [data, detail, trailerId, transitionKey, snapshot.key]);

  const { data: film, detail: filmDetail, trailerId: filmTrailerId } = snapshot;
  const tmdbAvg = film?.tmdb?.vote_average;
  const hasRating = typeof tmdbAvg === 'number' && tmdbAvg > 0;
  const description = filmDetail?.content ? stripHtmlToText(filmDetail.content) : '';
  const metaParts = [film?.year, film?.time, film?.episode_current].filter(Boolean);
  const categories = film?.category?.slice(0, 3) ?? [];

  return (
    <div
      className={`flex flex-col justify-center px-[24px] py-[28px] mdm:px-[18px] mdm:py-[20px] lg:px-[32px] lg:py-[32px] transition-all ease-out motion-reduce:transform-none ${
        visible
          ? 'opacity-100 translate-x-0 translate-y-0 duration-[420ms]'
          : `opacity-0 translate-y-[8px] ${enterFrom} duration-[220ms]`
      }`}
    >
      <div className="mb-[12px] flex flex-wrap items-center gap-[6px]">
        {film?.quality ? (
          <span className="rounded-[6px] border border-white/10 bg-white/5 px-[8px] py-[3px] text-[10px] font-semibold text-primary/90">
            {String(film.quality).toUpperCase()}
          </span>
        ) : null}
        {film?.lang ? (
          <span className="rounded-[6px] border border-white/10 bg-white/5 px-[8px] py-[3px] text-[10px] font-semibold text-primary/90">
            {String(film.lang)}
          </span>
        ) : null}
        {film?.chieurap ? (
          <span className="rounded-[6px] border border-amber-400/20 bg-amber-400/10 px-[8px] py-[3px] text-[10px] font-semibold text-amber-200">
            {FILM_UI_COPY.theatrical}
          </span>
        ) : null}
        {hasRating ? (
          <span className="inline-flex items-center gap-[4px] rounded-[999px] bg-[rgba(234,179,8,0.12)] px-[8px] py-[2px] text-[12px] font-semibold text-[#fbbf24] ring-1 ring-[rgba(234,179,8,0.16)]">
            <Star className="h-[12px] w-[12px] fill-current" />
            <span className="leading-[1]">{tmdbAvg!.toFixed(1)}</span>
          </span>
        ) : null}
      </div>

      <h2 className="text-[20px] max-w-[95%] lg:text-[24px] leading-[1.2] font-bold text-primary whitespace-nowrap overflow-hidden text-ellipsis">
        <Link href={`/phim/${film?.slug}`} className="hover:text-primary/85 transition-colors">
          {film?.name}
        </Link>
      </h2>

      {film?.origin_name ? (
        <p className="mt-[6px] text-[13px] lg:text-[14px] text-primary/60 line-clamp-1">
          {film.origin_name}
        </p>
      ) : null}

      <div className="flex items-center flex-wrap mt-[10px] text-[13px] text-primary/75">
        {metaParts.map((part, index) => (
          <React.Fragment key={`${part}-${index}`}>
            {index > 0 ? (
              <i className="mx-[6px] opacity-50">
                <DotIcon />
              </i>
            ) : null}
            <span>{part}</span>
          </React.Fragment>
        ))}
      </div>

      {categories.length > 0 ? (
        <div className="mt-[12px] flex flex-wrap gap-[6px]">
          {categories.map((cat) => (
            <Link
              key={cat.slug || cat.id || cat.name}
              href={`/the-loai/${cat.slug}`}
              className="rounded-[999px] border border-white/10 bg-white/5 px-[10px] py-[4px] text-[11px] font-medium text-primary/80 hover:bg-white/10 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      ) : null}

      {description ? (
        <p className="mt-[14px] text-[14px] text-primary/70 leading-[1.6] whitespace-pre-line line-clamp-3">
          {description}
        </p>
      ) : null}

      <div className="mt-[20px] lg:mt-[24px] flex flex-wrap items-center gap-[10px]">
        <Button
          to={`/phim/${film?.slug}`}
          leftIcon={<Play className="text-[18px]" />}
          className="!inline-flex gap-[10px] leading-[1.35] hover:!text-primary hover:opacity-90 py-[10px] px-[28px] lg:py-[12px] lg:px-[36px] text-[15px] !font-medium"
          primary
        >
          {FILM_UI_COPY.watchNow}
        </Button>
        {filmTrailerId ? (
          <Button
            to={`/phim/${film?.slug}`}
            className="!inline-flex gap-[8px] !bg-white/8 !text-primary ring-1 ring-white/12 hover:!bg-white/12 py-[10px] px-[20px] lg:py-[12px] lg:px-[24px] text-[14px] !font-medium"
          >
            {FILM_UI_COPY.trailer}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default BannerInfo;
