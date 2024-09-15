import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";
import { useSelector, useDispatch } from "react-redux";

import WatchListButton from "../../../../../components/Button/WatchListButton";
import { setStatusMovie } from "../../../../../redux/slices/videoPlayerSlice";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import { videoPlayerSelector } from "../../../../../redux/selectors";
import ScreenDimmer from "../../../../../components/ScreenDimmer";
import Button from "../../../../../components/Button";
import Status from "./Status";

function BarPlayer({ handleNext = () => {}, handlePrev = () => {} }) {
  const dispatch = useDispatch();

  const {
    statusMovie: { isLight, autoPlay, autoNext },
    episode: { currentEpisode },
  } = useSelector(videoPlayerSelector);

  const handleToggleStatus = (key, value) => {
    dispatch(setStatusMovie({ key: key, value: !value }));
  };

  const handleLightOff = () => {
    if (isLight) handleToggleStatus("isLight", isLight);
  };

  return (
    <FlexContainer className="px-[15px] items-center">
      <FlexItems>
        <FlexContainer>
          <FlexItems className="m-[5px]">
            <Button
              onClick={() => handleToggleStatus("isLight", isLight)}
              className="text-[12px] text-primary !font-medium"
              aria-label="light-mode-btn"
              data-active={isLight}
            >
              Light
              <Status isOn={isLight} />
            </Button>
            <ScreenDimmer onClick={handleLightOff} isShow={isLight} />
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button
              onClick={() => handleToggleStatus("autoPlay", autoPlay)}
              className="text-[12px] text-primary !font-medium"
              aria-label="auto-play-btn"
              data-active={autoPlay}
            >
              Auto Play
              <Status isOn={autoPlay} />
            </Button>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button
              onClick={() => handleToggleStatus("autoNext", autoNext)}
              className="text-[12px] text-primary !font-medium"
              aria-label="auto-next-btn"
              data-active={autoNext}
            >
              Auto Next
              <Status isOn={autoNext} />
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
      <FlexItems className="ml-auto">
        <FlexContainer className="gap-x-[8px] items-center">
          <FlexItems className="relative ssm:hidden m-[5px]">
            <WatchListButton right top />
          </FlexItems>
          <FlexItems
            aria-label="prev-btn"
            data-episode={currentEpisode - 1}
            className="m-[5px]"
          >
            <Button onClick={handlePrev} title="Previous video">
              <TbPlayerTrackPrevFilled className="text-[20px]" />
            </Button>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button
              aria-label="next-btn"
              data-episode={currentEpisode + 1}
              onClick={handleNext}
              title="Next video"
            >
              <TbPlayerTrackNextFilled className="text-[20px]" />
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
    </FlexContainer>
  );
}

export default BarPlayer;
