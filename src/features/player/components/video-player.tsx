"use client";

import * as React from "react";
import { PlayIconCustom } from "@/icons";
import VideoCore from "./video-core";
import BarPlayer from "./bar-player";
import { usePlayerStore } from "../stores/player-store";

interface VideoPlayerProps {
  dataEpisodes?: any[];
  dataMovie?: Record<string, any>;
  isWatchParty?: boolean;
}

export function VideoPlayer({
  dataEpisodes = [],
  dataMovie = {},
  isWatchParty = false,
}: VideoPlayerProps) {
  const [showPoster, setShowPoster] = React.useState(true);

  const autoPlay = usePlayerStore((state) => state.autoPlay);
  const currentEpisode = usePlayerStore((state) => state.episode.currentEpisode);
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);
  const setCurrentEpisode = usePlayerStore((state) => state.setCurrentEpisode);

  const { thumb_url, poster_url } = dataMovie;

  React.useEffect(() => {
    setShowPoster(true);
    setIsPlay(false);
  }, [currentEpisode, setIsPlay]);

  React.useEffect(() => {
    if (autoPlay) handlePlayVideo();
  }, [currentEpisode, autoPlay]);

  const handlePlayVideo = () => {
    setShowPoster(false);
    setIsPlay(true);
  };

  const handleNextEpisode = () => {
    if (currentEpisode >= dataEpisodes.length - 1) {
      return;
    }
    setCurrentEpisode(currentEpisode + 1);
  };

  const handlePrevEpisode = () => {
    if (currentEpisode <= 0) {
      return;
    }
    setCurrentEpisode(currentEpisode - 1);
  };

  return (
    <div className={`relative w-[100%] slm:w-[100%] 2xlm:w-[100%] slm:pl-0 ${isWatchParty ? "pl-0" : "pl-[300px]"}`}>
      <div className="relative">
        <div className="relative z-[5] pb-[56.25%] 2xls:pb-[460px] 2xlm:pb-[56.25%] slm:pb-[56.25%] h-0 leading-0">
          {showPoster ? (
            <div className="absolute inset-0 z-[100]">
              <div
                style={{
                  backgroundImage: `url(${thumb_url || poster_url})`,
                }}
                className={`relative bg-bg-layout w-[100%] h-full bg-center ${
                  thumb_url ? "bg-cover" : "bg-contain"
                } bg-no-repeat z-[50]`}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center z-[120]">
                <div>
                  <PlayIconCustom
                    className="text-[42px] pl-[8px] cursor-pointer"
                    onClick={handlePlayVideo}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute backdrop-blur-[20px] bg-[var(--bg-video-overlay)] inset-0 z-[120]">
              <VideoCore
                src={dataEpisodes[currentEpisode]?.link_m3u8}
                handleNext={handleNextEpisode}
              />
            </div>
          )}
        </div>
        <div className="video-external-controls relative z-[10] bg-[var(--bg-video-controls)] border-t border-solid border-[var(--video-external-bar-border)] py-[8px] shadow-[var(--video-external-bar-shadow)]">
          <BarPlayer
            handleNext={handleNextEpisode}
            handlePrev={handlePrevEpisode}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
