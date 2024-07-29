import {
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
} from "react-icons/tb";

import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import Button from "../../../../../components/Button";
import Status from "./Status";

function BarPlayer({
  isAutoPlay = false,
  isAutoNext = false,
  handleNext = () => {},
  handlePrev = () => {},
}) {
  return (
    <FlexContainer className="px-[15px] items-center">
      <FlexItems>
        <FlexContainer>
          <FlexItems className="m-[5px]">
            <p className="text-[12px] text-primary font-normal">
              Light
              <Status />
            </p>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <p className="text-[12px] text-primary font-normal">
              Auto Play
              <Status isOn={isAutoPlay} />
            </p>
          </FlexItems>
          <FlexItems className="m-[5px]">
            <p className="text-[12px] text-primary font-normal">
              Auto Next
              <Status isOn={isAutoNext} />
            </p>
          </FlexItems>
        </FlexContainer>
      </FlexItems>
      <FlexItems className="ml-auto">
        <FlexContainer className="gap-x-[8px] items-center">
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
