import classNames from "classnames";
import {
  TbPlayerSkipForward,
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
  TbRepeat,
  TbSun,
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

  const iconSm = (isOn) =>
    classNames(
      "size-[18px] shrink-0 detail769:hidden text-primary transition-opacity duration-150",
      isOn ? "opacity-100" : "opacity-[0.55]"
    );

  return (
    <FlexContainer className="video-external-bar min-w-0 items-center gap-x-1 px-[8px] min-[480px]:px-[15px]">
      <FlexItems className="min-w-0 shrink">
        <FlexContainer className="flex flex-nowrap items-center gap-x-1 gap-y-1 detail769:gap-x-0">
          <FlexItems className="m-0 border-0 pr-0 detail769:m-[5px] detail769:border-r detail769:border-solid detail769:border-bd-filed-form-color/25 detail769:pr-[12px]">
            <Button
              onClick={() => handleToggleStatus("isLight", isLight)}
              className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
              aria-label={isLight ? "Tắt Light" : "Bật Light"}
              title={`Light — ${isLight ? "On" : "Off"}`}
              data-active={isLight}
            >
              <TbSun className={iconSm(isLight)} aria-hidden />
              <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
                Light
                <Status isOn={isLight} />
              </span>
            </Button>
            <ScreenDimmer onClick={handleLightOff} isShow={isLight} />
          </FlexItems>
          <FlexItems className="m-0 border-0 pr-0 detail769:m-[5px] detail769:border-r detail769:border-solid detail769:border-bd-filed-form-color/25 detail769:pr-[12px]">
            <Button
              onClick={() => handleToggleStatus("autoPlay", autoPlay)}
              className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
              aria-label={autoPlay ? "Tắt Auto Play" : "Bật Auto Play"}
              title={`Auto Play — ${autoPlay ? "On" : "Off"}`}
              data-active={autoPlay}
            >
              <TbRepeat className={iconSm(autoPlay)} aria-hidden />
              <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
                Auto Play
                <Status isOn={autoPlay} />
              </span>
            </Button>
          </FlexItems>
          <FlexItems className="m-0 detail769:m-[5px]">
            <Button
              onClick={() => handleToggleStatus("autoNext", autoNext)}
              className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
              aria-label={autoNext ? "Tắt Auto Next" : "Bật Auto Next"}
              title={`Auto Next — ${autoNext ? "On" : "Off"}`}
              data-active={autoNext}
            >
              <TbPlayerSkipForward className={iconSm(autoNext)} aria-hidden />
              <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
                Auto Next
                <Status isOn={autoNext} />
              </span>
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
      <FlexItems className="ml-auto shrink-0">
        <FlexContainer className="gap-x-[6px] items-center min-[480px]:gap-x-[8px]">
          <FlexItems className="relative ssm:hidden m-[5px]">
            <WatchListButton right top />
          </FlexItems>
          <FlexItems
            aria-label="prev-btn"
            data-episode={currentEpisode - 1}
            className="m-[2px] min-[480px]:m-[5px]"
          >
            <Button onClick={handlePrev} title="Tập trước">
              <TbPlayerTrackPrevFilled className="text-[18px] detail769:text-[20px]" />
            </Button>
          </FlexItems>
          <FlexItems className="m-[2px] min-[480px]:m-[5px]">
            <Button
              aria-label="next-btn"
              data-episode={currentEpisode + 1}
              onClick={handleNext}
              title="Tập sau"
            >
              <TbPlayerTrackNextFilled className="text-[18px] detail769:text-[20px]" />
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
    </FlexContainer>
  );
}

export default BarPlayer;
