'use client';

import React from 'react';

import SkeletonContainer from './Skeleton';

const strong = {
  baseColor: 'var(--skeleton-base-strong)',
  highlightColor: 'var(--skeleton-highlight-strong)',
} as const;

function Line({
  className,
  height = 14,
  radius = 4,
}: {
  className?: string;
  height?: number;
  radius?: number;
}) {
  return (
    <div className={className} style={{ height }}>
      <SkeletonContainer borderRadius={radius} {...strong} />
    </div>
  );
}

function Badge({ width = 56 }: { width?: number }) {
  return (
    <div style={{ width, height: 22 }}>
      <SkeletonContainer borderRadius={6} {...strong} />
    </div>
  );
}

function IconBtnSkel({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <SkeletonContainer borderRadius={8} {...strong} />
    </div>
  );
}

/** Loading layout for the player, episode list, and film details. */
const PlayerSkeleton: React.FC = () => {
  return (
    <div className="relative px-[15px]">
      <div className="mx-auto 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
        <div className="relative pt-[20px] pb-[50px] slm:pt-0 2xlm:pb-[20px] slm:pb-[10px]">
          {/* Current-episode label, hidden on mobile. */}
          <div className="mb-[16px] slm:hidden">
            <Line className="max-w-[360px]" height={12} />
          </div>

          <div className="relative w-full">
            <div className="relative flex w-full flex-col">
              {/* Player column — 75% desktop */}
              <div className="relative h-fit w-full player3col:w-[75%]">
                {/* Video + bar */}
                <div className="pl-[300px] slm:pl-0">
                  <div className="relative overflow-hidden rounded-[8px] bg-bg-player pb-[56.25%] ring-1 ring-white/10">
                    <div className="absolute inset-0">
                      <SkeletonContainer borderRadius={8} />
                    </div>
                    {/* Compact play icon. */}
                    <div className="absolute left-1/2 top-1/2 z-10 size-8 -translate-x-1/2 -translate-y-1/2">
                      <SkeletonContainer circle {...strong} />
                    </div>
                  </div>

                  {/* BarPlayer — 52px compact */}
                  <div className="mt-0 border-t border-[var(--video-external-bar-border)] bg-[#08090b] px-[12px] detail769:px-[16px]">
                    {/* Mobile */}
                    <div className="flex h-[52px] w-full items-center justify-between detail769:hidden">
                      <div className="flex items-center gap-[2px]">
                        <IconBtnSkel />
                        <IconBtnSkel />
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <Line className="w-[40px]" height={12} />
                        <IconBtnSkel size={32} />
                        <IconBtnSkel size={32} />
                      </div>
                    </div>

                    {/* Desktop ≥769 */}
                    <div className="hidden h-[52px] w-full items-center justify-between detail769:flex">
                      <div className="flex items-center gap-[2px]">
                        <IconBtnSkel />
                        <IconBtnSkel />
                        <IconBtnSkel />
                        <IconBtnSkel />
                      </div>
                      <div className="flex items-center gap-[16px]">
                        <div className="flex flex-col items-end gap-[4px]">
                          <Line className="w-[88px]" height={13} />
                          <Line className="w-[48px]" height={11} />
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <div className="h-[32px] w-[72px]">
                            <SkeletonContainer borderRadius={6} {...strong} />
                          </div>
                          <div className="h-[32px] w-[72px]">
                            <SkeletonContainer borderRadius={6} {...strong} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Episode list: sidebar on desktop, stacked on mobile. */}
                <div className="absolute left-0 top-0 flex h-full w-[300px] flex-col overflow-hidden rounded-[8px] bg-bg-player ring-1 ring-white/10 slm:relative slm:mt-[12px] slm:h-auto slm:max-h-[350px] slm:w-full mdm:max-h-[225px]">
                  <div className="space-y-[10px] border-b border-white/10 p-[12px]">
                    <Line className="max-w-[110px]" height={13} />
                    <div className="flex gap-[6px]">
                      <Badge width={72} />
                      <Badge width={88} />
                    </div>
                    <div className="flex gap-[8px]">
                      <Line className="w-[72px]" height={30} radius={6} />
                      <Line className="flex-1" height={30} radius={6} />
                    </div>
                  </div>
                  <div className="space-y-[2px] overflow-hidden p-[8px]">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-[10px] rounded-[6px] px-[8px] py-[8px] ${
                          i >= 5 ? 'mdm:hidden' : ''
                        } ${i >= 7 ? 'slm:hidden mdm:flex' : ''}`}
                      >
                        <Line className="w-[52px]" height={14} />
                        <Line className="flex-1" height={14} />
                        <div className="size-[16px] shrink-0">
                          <SkeletonContainer circle {...strong} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Film details: side panel on desktop, stacked on mobile. */}
              <div className="detail-film-scroll relative z-auto w-full min-h-0 overflow-visible px-[8px] py-[28px] clm:py-[20px] player3col:absolute player3col:inset-y-0 player3col:right-0 player3col:z-[1] player3col:w-[25%] player3col:overflow-y-auto player3col:overflow-x-hidden player3col:overscroll-y-contain player3col:px-0 player3col:py-0 player3col:pl-4 player3col:pr-[8px]">
                <div className="relative detail-film-panel w-full space-y-[14px] mdm:space-y-[12px]">
                  <div className="hidden detail769:block">
                    <Line className="max-w-[70%]" height={12} />
                  </div>

                  <div className="flex flex-col items-center gap-[12px] mdm:gap-[14px]">
                    <div className="relative h-[220px] w-[150px] overflow-hidden rounded-[12px] ring-1 ring-white/10 detail769:h-[250px] detail769:w-[170px]">
                      <div className="absolute inset-0">
                        <SkeletonContainer borderRadius={12} {...strong} />
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-center space-y-[8px] text-center mdm:space-y-[10px]">
                      <Line className="mx-auto max-w-[90%] mdm:max-w-[88%]" height={20} />
                      <Line className="mx-auto max-w-[52%]" height={13} />
                      <div className="flex flex-wrap justify-center gap-[6px] pt-[2px]">
                        <Badge width={64} />
                        <Badge width={40} />
                        <Badge width={80} />
                      </div>
                      <div className="flex flex-wrap justify-center gap-[6px]">
                        <Badge width={48} />
                        <Badge width={60} />
                        <Badge width={68} />
                      </div>
                      <div className="flex flex-wrap justify-center gap-[6px]">
                        <Badge width={64} />
                        <Badge width={72} />
                        <Badge width={56} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-[8px] mdm:gap-[10px]">
                    <div className="h-[40px] w-[44%] min-w-[120px] max-w-[160px] mdm:w-[120px]">
                      <SkeletonContainer borderRadius={8} {...strong} />
                    </div>
                    <div className="h-[40px] w-[52%] min-w-[150px] max-w-[200px] mdm:w-[180px]">
                      <SkeletonContainer borderRadius={8} {...strong} />
                    </div>
                  </div>

                  <div className="space-y-[8px] rounded-[10px] bg-bg-sidebar/60 p-[12px]">
                    <Line className="max-w-[110px]" height={14} />
                    <Line height={12} />
                    <Line className="max-w-[92%]" height={12} />
                    <Line className="max-w-[68%]" height={12} />
                  </div>

                  <div className="border-t border-solid border-white/10 pt-[12px]">
                    <div className="grid grid-cols-1 gap-y-[10px] min-[520px]:grid-cols-2 min-[520px]:gap-x-[24px]">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="flex flex-col gap-[4px] py-[4px]">
                          <Line className="max-w-[80px]" height={11} />
                          <Line className="max-w-[140px]" height={13} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSkeleton;
