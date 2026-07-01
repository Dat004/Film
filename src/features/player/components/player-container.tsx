"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { FilmDetailResponse } from "@/features/film/services/film-service";
import DetailFilmPlayer from "./detail-film-player";
import EpisodesPlayer from "./episodes-player";
import PlayerSkeletonImport from "@/components/Skeleton/PlayerSkeleton";
import { usePlayerStore } from "../stores/player-store";

const PlayerSkeleton = PlayerSkeletonImport as any;

const VideoPlayer = dynamic(() => import("./video-player"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full pb-[56.25%] bg-bg-layout-loading animate-pulse rounded-[8px]"></div>
  ),
});

interface PlayerContainerProps {
  data: FilmDetailResponse;
  isWatchParty?: boolean;
}

export default function PlayerContainer({ data, isWatchParty = false }: PlayerContainerProps) {
  const setAllEpisodes = usePlayerStore((state) => state.setAllEpisodes);
  const setCurrentEpisode = usePlayerStore((state) => state.setCurrentEpisode);
  const setIsPlay = usePlayerStore((state) => state.setIsPlay);
  const setIsFullScreen = usePlayerStore((state) => state.setIsFullScreen);
  const setIsMuted = usePlayerStore((state) => state.setIsMuted);
  const setCurrentVolume = usePlayerStore((state) => state.setCurrentVolume);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);

  const episodesData = data?.episodes?.[0]?.server_data || [];
  const movieData = data?.movie || {};

  React.useEffect(() => {
    if (episodesData.length > 0) {
      setAllEpisodes(episodesData);
      setCurrentEpisode(0);
      setIsPlay(false);
    }
  }, [episodesData, setAllEpisodes, setCurrentEpisode, setIsPlay]);

  if (!data || !data.movie) {
    return <PlayerSkeleton />;
  }

  return (
    <div className="flex flex-col gap-[30px] w-full">
      <div className="flex flex-col slm:flex-row relative z-[10] isolate shadow-[var(--preview-shadow)]">
        <VideoPlayer 
          dataEpisodes={episodesData} 
          dataMovie={movieData} 
          isWatchParty={isWatchParty} 
        />
        {!isWatchParty && (
          <div className="hidden slm:block absolute left-0 top-0 w-[300px] h-full bg-[var(--bg-sidebar)] z-[20] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <EpisodesPlayer dataEpisodes={episodesData} />
          </div>
        )}
      </div>

      {!isWatchParty && (
        <div className="block slm:hidden w-full">
          <EpisodesPlayer dataEpisodes={episodesData} />
        </div>
      )}

      <div className="w-full">
        <DetailFilmPlayer dataMovie={movieData} data={data} isWatchParty={isWatchParty} />
      </div>
    </div>
  );
}
