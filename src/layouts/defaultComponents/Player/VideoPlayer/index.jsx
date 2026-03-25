import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import { videoPlayerSelector } from "../../../../redux/selectors";
import {
  setCurrentEpisode,
  setStatusMovie,
} from "../../../../redux/slices/videoPlayerSlice";
import { PlayIconCustom } from "../../../../icons";
import Video from "../../../../components/Video";
import BarPlayer from "./BarPlayer";

function VideoPlayer({ dataEpisodes = [], dataMovie = {} }) {
  const [showPoster, setShowPoster] = useState(true);

  const videoPlayerState = useSelector(videoPlayerSelector);
  const dispatch = useDispatch();

  const { statusMovie, episode } = videoPlayerState;
  const { autoPlay } = statusMovie;
  const { thumb_url, poster_url } = dataMovie;
  const { currentEpisode } = episode;

  useEffect(() => {
    setShowPoster(true);
    dispatch(setStatusMovie({ key: "isPlay", value: false }));
  }, [currentEpisode]);

  useEffect(() => {
    if (autoPlay) handlePlayVideo();
  }, [currentEpisode, autoPlay]);

  const handlePlayVideo = () => {
    setShowPoster(false);
    dispatch(setStatusMovie({ key: "isPlay", value: true }));
  };

  const handleNextEpisode = () => {
    if (currentEpisode >= dataEpisodes?.length - 1) {
      return;
    }

    dispatch(setCurrentEpisode(currentEpisode + 1));
  };

  const handlePrevEpisode = () => {
    if (currentEpisode <= 0) {
      return;
    }

    dispatch(setCurrentEpisode(currentEpisode - 1));
  };

  return (
    <div className="relative w-[100%] pl-[300px] slm:w-[100%] 2xlm:w-[100%] slm:pl-0">
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
              <FlexContainer className="absolute inset-0 items-center justify-center z-[120]">
                <FlexItems>
                  <PlayIconCustom
                    className="text-[42px] pl-[8px]"
                    onClick={handlePlayVideo}
                  />
                </FlexItems>
              </FlexContainer>
            </div>
          ) : (
            <div className="absolute backdrop-blur-[20px] bg-[var(--bg-video-overlay)] inset-0 z-[120]">
              <Video
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
