import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";

import WatchListButton from "../../../../../components/Button/WatchListButton";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import ScreenDimmer from "../../../../../components/ScreenDimmer";
import Button from "../../../../../components/Button";
import Status from "./Status";

function BarPlayer({
  isLight = false,
  isAutoPlay = false,
  isAutoNext = false,
  handleNext = () => {},
  handlePrev = () => {},
  handleToggleStatus = () => {},
}) {
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
            >
              Light
              <Status isOn={isLight} />
            </Button>
            <ScreenDimmer onClick={handleLightOff} isShow={isLight} />
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button
              onClick={() => handleToggleStatus("autoPlay", isAutoPlay)}
              className="text-[12px] text-primary !font-medium"
            >
              Auto Play
              <Status isOn={isAutoPlay} />
            </Button>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button
              onClick={() => handleToggleStatus("autoNext", isAutoNext)}
              className="text-[12px] text-primary !font-medium"
            >
              Auto Next
              <Status isOn={isAutoNext} />
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
      <FlexItems className="ml-auto">
        <FlexContainer className="gap-x-[8px] items-center">
          <FlexItems className="relative ssm:hidden m-[5px]">
            <WatchListButton right top />
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button onClick={handlePrev} title="Previous video">
              <TbPlayerTrackPrevFilled className="text-[20px]" />
            </Button>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <Button onClick={handleNext} title="Next video">
              <TbPlayerTrackNextFilled className="text-[20px]" />
            </Button>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
    </FlexContainer>
  );
}

export default BarPlayer;
