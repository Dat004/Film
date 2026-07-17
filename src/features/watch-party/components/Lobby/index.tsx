'use client';

import { Users, Compass, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import images from '@/assets/images';
import Button from '@/components/ui/Button';
import HeaderContainer from '@/components/ui/Container/HeaderContainer';
import EmptyState from '@/components/ui/EmptyState';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import SkeletonContainer from '@/components/ui/Skeleton';
import FilmCardImage from '@/features/film/components/FilmCardImage';
import { pushRoute } from '@/lib/route-navigation';

import { DEFAULT_AVATAR_URL } from '../../constants/watch-party.constants';
import { useWatchPartyLobby } from '../../hooks/useWatchPartyLobby';
import type { WatchPartyLobbyEntry } from '../../types/watch-party.types';

const loadingAsset = images.imgLoadingVertical as string | { src?: string } | undefined;
const placeholderSrc: string =
  typeof loadingAsset === 'string' ? loadingAsset : loadingAsset?.src || '';

const WatchPartyLobby: React.FC = () => {
  const router = useRouter();
  const { rooms, loading, error } = useWatchPartyLobby();

  return (
    <div className="watch-party-lobby pb-10" data-testid="watch-party-lobby">
      <div className="mb-6 sm:mb-8">
        <HeaderContainer title="Phòng xem chung" className="mb-2" />
        <p className="max-w-[640px] text-[14px] leading-relaxed text-secondary">
          Tham gia xem phim cùng mọi người. Chat trực tiếp, đồng bộ video — chọn một phòng và bắt
          đầu ngay.
        </p>
      </div>

      <div>
        {error && (
          <p className="mb-4 text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <FlexContainer className="!items-start !gap-y-[20px] mx-[-8px] pb-[24px]" isWrap>
            {Array.from({ length: 10 }).map((_, index) => (
              <FlexItems
                className="w-[20%] clm:w-[25%] mdm:w-[calc(100%/3)] ccm:w-[50%] px-[8px]"
                key={index}
              >
                <div className="w-full">
                  <div className="relative mb-2 aspect-[2/3] w-full overflow-hidden rounded-[10px] bg-fill-secondary ring-1 ring-white/10">
                    <SkeletonContainer />
                  </div>
                  <div className="mb-1 h-4 w-[85%] overflow-hidden rounded bg-fill-secondary relative">
                    <SkeletonContainer />
                  </div>
                  <div className="h-3 w-[55%] overflow-hidden rounded bg-fill-secondary relative">
                    <SkeletonContainer />
                  </div>
                </div>
              </FlexItems>
            ))}
          </FlexContainer>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Chưa có phòng nào"
            description="Chưa có phòng xem chung công khai nào đang mở. Hãy chọn một phim bất kỳ và tạo phòng chiếu đầu tiên."
            descriptionClassName="max-w-[520px]"
          >
            <Button
              type="button"
              primary
              onClick={() => pushRoute(router, '/')}
              leftIcon={<Compass className="text-[18px]" />}
              className="!inline-flex gap-[10px] px-[28px] py-[12px] text-[15px] !font-semibold leading-[1.35] hover:!text-primary hover:opacity-90"
            >
              Tìm phim xem ngay
            </Button>
          </EmptyState>
        ) : (
          <FlexContainer className="!items-start !gap-y-[20px] mx-[-8px] pb-[24px]" isWrap>
            {rooms.map((room: WatchPartyLobbyEntry) => {
              const roomId = room.roomId || '';
              const membersCount = room.memberCount ?? 0;
              const movieName = room.filmName || 'Phim ẩn danh';
              const categoryName = room.categoryName;
              const posterUrl = room.posterUrl || '';
              const metaLine = [
                categoryName,
                `${membersCount}/20 người`,
                room.isPrivate ? 'Riêng tư' : null,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <FlexItems
                  className="w-[20%] clm:w-[25%] mdm:w-[calc(100%/3)] ccm:w-[50%] px-[8px]"
                  key={roomId}
                >
                  <button
                    type="button"
                    onClick={() => pushRoute(router, `/watch-party/${roomId}`)}
                    className="group/film relative w-full cursor-pointer select-none text-left outline-none"
                    aria-label={`Vào phòng xem ${movieName}`}
                  >
                    <div className="relative mb-2 aspect-[2/3] w-full overflow-hidden rounded-[10px] bg-fill-secondary ring-1 ring-white/10">
                      <FilmCardImage
                        src={posterUrl || undefined}
                        alt={movieName}
                        placeholderSrc={placeholderSrc}
                        className="transition-transform duration-300 group-hover/film:scale-[1.04]"
                      />

                      <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1">
                        {room.hostConnected === false ? (
                          <span className="inline-flex items-center gap-1 rounded-[5px] border border-amber-400/30 bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 backdrop-blur-[6px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            HOST OFFLINE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-[5px] border border-white/10 bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-[6px]">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                            LIVE
                          </span>
                        )}
                        {room.isPrivate ? (
                          <span className="inline-flex items-center rounded-[5px] border border-white/10 bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-[6px]">
                            <Lock className="mr-0.5 h-3 w-3" />
                            KHÓA
                          </span>
                        ) : null}
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2.5 pb-2.5 pt-10">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={room.hostPhoto || DEFAULT_AVATAR_URL}
                            alt=""
                            className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                          />
                          <span className="truncate text-[11px] font-medium text-white/90">
                            {room.hostName || 'Ẩn danh'}
                          </span>
                          <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-white/80">
                            <Users className="h-3 w-3" />
                            {membersCount}
                          </span>
                        </div>
                      </div>

                      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/35 opacity-0 backdrop-blur-[10px] transition-opacity duration-200 group-hover/film:opacity-100 mdm:flex sm:flex">
                        <span className="rounded-full bg-bg-btn-primary px-4 py-2 text-[12px] font-semibold text-white shadow-lg">
                          Vào xem
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-1 line-clamp-2 text-[14.3px] font-medium leading-[1.3] text-primary">
                      {movieName}
                    </h3>
                    {metaLine ? (
                      <p className="line-clamp-1 text-[12px] font-medium text-title">{metaLine}</p>
                    ) : null}
                  </button>
                </FlexItems>
              );
            })}
          </FlexContainer>
        )}
      </div>
    </div>
  );
};

export default WatchPartyLobby;
