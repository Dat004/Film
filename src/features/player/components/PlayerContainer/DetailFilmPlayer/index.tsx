'use client';

import React from 'react';

import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import FilmMetaBadges from '@/features/film/components/FilmMetaBadges';
import FilmTagLinks from '@/features/film/components/FilmTagLinks';
import type { FilmDataResponse, FilmDetail } from '@/features/film/types/film.types';
import { CreateWatchPartyButton } from '@/features/watch-party';
import type { WatchPartyFilmMeta } from '@/features/watch-party/types/watch-party.types';
import { resolveFilmImageUrl } from '@/lib/film-detail';

import { PLAYER_UI_COPY } from '../../../constants/player-ui.constants';

import FilmBreadcrumb from './FilmBreadcrumb';
import FilmHtmlContent from './FilmHtmlContent';
import FilmRatingBadges from './FilmRatingBadges';
import InfoDisplay from './InfoDisplay';
import TrailerModal from './TrailerModal';

export interface DetailFilmProps {
  dataMovie?: Partial<FilmDetail>;
  data?: FilmDataResponse | Record<string, unknown>;
  slug?: string;
  isWatchParty?: boolean;
}

const DetailFilm: React.FC<DetailFilmProps> = ({ dataMovie = {}, isWatchParty = false }) => {
  const {
    poster_url,
    name,
    content,
    origin_name,
    country,
    category,
    type,
    status,
    year,
    lang,
    quality,
    episode_total,
    time,
    episode_current,
    trailer_url,
    notify,
    showtimes,
    chieurap,
  } = dataMovie;

  const posterUrl = resolveFilmImageUrl(poster_url);
  const primaryCategory = category?.[0];

  const filmMeta: WatchPartyFilmMeta = {
    name: dataMovie?.name || 'Phim',
    posterUrl: dataMovie?.poster_url || '',
    ...(dataMovie?.category?.[0]?.name
      ? { categoryName: dataMovie.category[0].name as string }
      : {}),
  };

  const infoPrimary = [
    { key: 'Loại phim', value: type },
    { key: 'Trạng thái', value: status },
    { key: 'Năm phát hành', value: year },
  ];

  const infoSecondary = [
    { key: 'Phụ đề', value: lang },
    { key: 'Chất lượng', value: quality },
    { key: 'Tổng số tập', value: episode_total },
    { key: 'Thời lượng', value: time },
    { key: 'Tập hiện tại', value: episode_current },
  ];

  return (
    <div className="relative detail-film-panel w-full">
      <FilmBreadcrumb filmName={name} category={primaryCategory} />

      {/* Centered poster and film identity. */}
      <FlexContainer className="flex flex-col items-center gap-[14px] mdm:gap-[16px]">
        <FlexItems className="flex w-full justify-center">
          <div className="detail-film-poster relative w-[170px] h-[250px] mdm:w-[150px] mdm:h-[220px] rounded-[12px] overflow-hidden ring-1 ring-bd-filed-form-color shadow-lg bg-bg-sidebar">
            {posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterUrl}
                alt={name || 'Poster'}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            ) : null}
            {quality ? (
              <span className="absolute top-[8px] left-[8px] rounded-[4px] bg-black/70 px-[6px] py-[2px] text-[10px] font-bold text-white uppercase">
                {quality}
              </span>
            ) : null}
          </div>
        </FlexItems>

        <FlexItems className="w-full min-w-0 flex flex-col items-center text-center space-y-[10px]">
          <h2 className="line-clamp-2 w-full text-center text-[22px] xlm:text-[18px] mdm:text-[17px] leading-[1.25] text-primary font-semibold tracking-tight">
            {name}
          </h2>

          {origin_name && origin_name !== name ? (
            <p className="text-center text-[14px] font-medium text-primary/85">{origin_name}</p>
          ) : null}

          <FilmRatingBadges movie={dataMovie} />
          <FilmMetaBadges movie={dataMovie} />
          <FilmTagLinks categories={category} countries={country} />
        </FlexItems>
      </FlexContainer>

      {!isWatchParty && (
        <div className="mt-[16px] flex flex-wrap justify-center gap-[10px]">
          <TrailerModal trailerUrl={trailer_url} />
          <CreateWatchPartyButton
            filmId={dataMovie?.slug || 'sample'}
            filmMeta={filmMeta}
            creatingLabel={PLAYER_UI_COPY.creatingRoom}
            idleLabel={PLAYER_UI_COPY.createWatchParty}
          />
        </div>
      )}

      <section className="mt-[20px] bg-bg-sidebar/60">
        <h3 className="text-[14px] font-semibold text-primary mb-[12px]">
          {PLAYER_UI_COPY.filmContentHeading}
        </h3>
        <FilmHtmlContent html={content} lineClamp={2} />
      </section>

      {(notify || showtimes || chieurap) && (
        <div className="mt-[14px] rounded-[8px] border border-bd-filed-form-color bg-bg-sidebar p-[12px] text-[13px] text-secondary leading-relaxed">
          {chieurap ? (
            <p className="font-medium text-primary mb-[4px]">{PLAYER_UI_COPY.theatricalNote}</p>
          ) : null}
          {notify ? <p>{notify}</p> : null}
          {showtimes ? <p className="mt-[4px]">{showtimes}</p> : null}
        </div>
      )}

      <div className="detail-film-meta-section mt-[20px] pt-[20px] border-t border-solid border-bd-filed-form-color">
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-x-[28px] gap-y-0">
          <InfoDisplay data={infoPrimary} />
          <InfoDisplay data={infoSecondary} />
        </div>
      </div>
    </div>
  );
};

export default DetailFilm;
