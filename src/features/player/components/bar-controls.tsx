"use client";

import * as React from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import { BiFullscreen, BiVolumeFull, BiVolumeMute } from "react-icons/bi";

import CurrentTime from "@/components/ui/current-time";
import RangeSlider from "@/components/ui/range-slider";
import { usePlayerStore } from "../stores/player-store";

interface BarControlsProps {
  src?: string;
  handlePlay?: () => void;
  handleChangeTime?: (e: any, value: number) => void;
  handleFullScreen?: () => void;
}

export function BarControls({
  src = "",
  handlePlay = () => {},
  handleChangeTime = () => {},
  handleFullScreen = () => {},
}: BarControlsProps) {
  const [currentTimeCapture, setCurrentTimeCapture] = React.useState(0);
  const previewThumbnailRef = React.useRef<HTMLDivElement | null>(null);

  const { currentTime, duration } = usePlayerStore((state) => state.time);
  const isPlay = usePlayerStore((state) => state.isPlay);
  const isMuted = usePlayerStore((state) => state.isMuted);
  const currentVolume = usePlayerStore((state) => state.currentVolume);
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);

  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>, currentValue: number) => {
    if (!previewThumbnailRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.left - previewThumbnailRef.current.getBoundingClientRect().width / 2;
    previewThumbnailRef.current.style.transform = `translateX(${position}px)`;
    setCurrentTimeCapture(currentValue);
  };

  const handleChangeVolume = (_: any, nextVolume: number) => {
    setIsMuted(nextVolume !== 0 ? false : true);
    setCurrentVolume(nextVolume);
  };

  const handleToggleMuteVideo = () => {
    setCurrentVolume(!isMuted ? 0 : 1);
    setIsMuted(!isMuted);
  };

  return (
    <>
      <div className="group/slider relative w-full mt-[-7px]">
        <RangeSlider
          max={duration}
          borderRadius={0}
          value={currentTime}
          onMove={handleMouseMove as any}
          onChange={handleChangeTime as any}
        />
        <div
          className="absolute bottom-[calc(100%+10px)] opacity-0 pointer-events-none transition-opacity duration-200 will-change-[transform] translate-x-[-50%] group-hover/slider:opacity-100"
          ref={previewThumbnailRef}
        >
          <span>
            <CurrentTime
              className="bg-bg-layer-btn min-w-[34px] px-[10px] py-[6px] rounded-[4px] text-[14px] font-normal text-primary"
              currentTime={currentTimeCapture}
            />
          </span>
        </div>
      </div>
      <div className="w-full h-full">
        <div className="flex h-full py-[12px] items-center">
          <div className="w-[50%] px-[15px] flex-grow flex-shrink-0">
            <div className="flex items-center gap-x-[18px]">
              <div>
                <button
                  type="button"
                  onClick={handlePlay}
                  className="flex items-center justify-center text-primary"
                >
                  <i className="text-[24px]">
                    {!isPlay ? <IoPlay /> : <IoPause />}
                  </i>
                </button>
              </div>
              <div>
                <div className="flex items-center">
                  <span>
                    <CurrentTime
                      className="text-[14px] font-normal text-primary"
                      currentTime={currentTime}
                    />
                  </span>
                  <span className="mx-[5px] text-[14px] font-normal text-primary opacity-50">
                    &#47;
                  </span>
                  <span>
                    <CurrentTime
                      className="text-[14px] font-normal text-primary opacity-50"
                      currentTime={duration}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[50%] px-[15px] flex-grow flex-shrink-0">
            <div className="flex justify-end gap-x-[18px]">
              <div>
                <div className="flex items-center">
                  <div className="mr-[8px]">
                    <button
                      type="button"
                      onClick={handleToggleMuteVideo}
                      className="flex items-center justify-center text-primary"
                    >
                      <i className="text-[22px]">
                        {isMuted ? <BiVolumeMute /> : <BiVolumeFull />}
                      </i>
                    </button>
                  </div>
                  <div>
                    <RangeSlider
                      className="flex-grow min-w-[100px]"
                      borderRadius={6}
                      onChange={handleChangeVolume as any}
                      value={currentVolume}
                      max={1}
                    />
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleFullScreen}
                  title="Xem toàn màn hình"
                  className="flex items-center justify-center text-primary"
                >
                  <BiFullscreen className="text-[22px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BarControls;

