import { useDispatch, useSelector } from "react-redux";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import Video from "../../../../components/Video";
import { PlayIconCustom } from "../../../../icons";
import { videoPlayerSelector } from "../../../../redux/selectors";
import {
    setCurrentEpisode,
    setStatusMovie,
} from "../../../../redux/slices/videoPlayerSlice";
import BarPlayer from "./BarPlayer";

function VideoPlayer({ dataEpisodes = [], thumbUrl = "" }) {
  const videoPlayerState = useSelector(videoPlayerSelector);
  const dispatch = useDispatch();

  const { statusMovie, episode } = videoPlayerState;
  const {
    isPlay,
    autoPlay,
    autoNext,
  } = statusMovie;
  const { currentEpisode } = episode;

  const handlePlayVideo = () => {
    dispatch(setStatusMovie({ key: "isPlay", value: true }));
  };

  const handleNextEpisode = () => {
    if (currentEpisode >= dataEpisodes?.length - 1) {
      return;
    }

    if (!autoPlay && isPlay) {
      dispatch(setStatusMovie({ key: "isPlay", value: false }));
    }

    dispatch(setCurrentEpisode(currentEpisode + 1));
  };

  const handlePrevEpisode = () => {
    if (currentEpisode <= 0) {
      return;
    }

    if (!autoPlay && isPlay) {
      dispatch(setStatusMovie({ key: "isPlay", value: false }));
    }

    dispatch(setCurrentEpisode(currentEpisode - 1));
  };

  return (
    <div className="w-[100%] pl-[300px] slm:w-[100%] 2xlm:w-[100%] slm:pl-0">
      <div className="relative pb-[56.25%] 2xls:pb-[460px] 2xlm:pb-[56.25%] slm:pb-[56.25%] h-0 leading-0">
        <div className="absolute inset-0">
          <div
            style={{
              backgroundImage: `url(${thumbUrl})`,
            }}
            className="relative w-[100%] h-full bg-center bg-cover bg-no-repeat z-[50]"
          ></div>
          <FlexContainer className="absolute inset-0 items-center justify-center z-[99]">
            <FlexItems>
              <PlayIconCustom
                className="text-[42px] pl-[8px]"
                onClick={handlePlayVideo}
              />
            </FlexItems>
          </FlexContainer>
        </div>
        <div className="absolute backdrop-blur-[20px] bg-[#ffffff0d] inset-0 z-[120]">
          <Video src={dataEpisodes[currentEpisode]?.link_m3u8} />
        </div>
      </div>
      <div className="bg-[#08090b] py-[5px]">
        <BarPlayer
          isAutoNext={autoNext}
          isAutoPlay={autoPlay}
          handleNext={handleNextEpisode}
          handlePrev={handlePrevEpisode}
        />
      </div>
    </div>
  );
}

export default VideoPlayer;
