import { IoPlay, IoPause } from "react-icons/io5";
import { BiFullscreen } from "react-icons/bi";
import { BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { useDispatch } from "react-redux";

import { setStatusMovie } from "../../../../../redux/slices/videoPlayerSlice";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import InputSlider from "../../../../../components/InputSlider";
import Button from "../../../../../components/Button";
import { useVideoTime } from "../../../../../hooks";

function BarControls({
  isPlay = false,
  isMuted = false,
  currentTime = 0,
  currentVolume = 0,
  duration = 0,
  handlePlay = () => {},
}) {
  const dispatch = useDispatch();
  const currentTimeValue = useVideoTime(currentTime);
  const durationValue = useVideoTime(duration);

  const handleChangeTime = (currentTime) => {
    dispatch(setStatusMovie({ key: "currentTime", value: currentTime }));
  };

  const handleChangeVolume = (currentVolume) => {
    dispatch(
      setStatusMovie({
        key: "isMuted",
        value: currentVolume !== 0 ? false : true,
      })
    );
    dispatch(setStatusMovie({ key: "currentVolume", value: currentVolume }));
  };

  const handleDrag = () => {
    dispatch(setStatusMovie({ key: "isSeeked", value: true }));
    dispatch(setStatusMovie({ key: "isPlay", value: false }));
  };

  const handleDrop = () => {
    dispatch(setStatusMovie({ key: "isSeeked", value: false }));
    dispatch(setStatusMovie({ key: "isPlay", value: true }));
  };

  const handleToggleMuteVideo = () => {
    dispatch(setStatusMovie({ key: "currentVolume", value: !isMuted ? 0 : 1 }));
    dispatch(setStatusMovie({ key: "isMuted", value: !isMuted }));
  };

  const handleFullScreen = () => {
    // dispatch(setStatusMovie({ key: "isFullScreen", value: true }));
  };

  return (
    <>
      <div className="w-[100%]">
        <InputSlider
          value={currentTime}
          min={0}
          max={duration}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          onChange={handleChangeTime}
        />
      </div>
      <div className="w-[100%] h-full">
        <FlexContainer className="h-full py-[12px] items-center">
          <FlexItems className="w-[50%] px-[15px] flex-grow flex-shrink-0">
            <FlexContainer className="items-center gap-x-[18px]">
              <FlexItems>
                <Button onClick={handlePlay}>
                  <i className="text-[24px]">
                    {!isPlay ? <IoPlay /> : <IoPause />}
                  </i>
                </Button>
              </FlexItems>
              <FlexItems>
                <FlexContainer className="items-center">
                  <span className="text-[14px] font-normal text-primary">
                    {currentTimeValue}
                  </span>
                  <span className="mx-[5px] text-[14px] font-normal text-primary opacity-50">
                    &#47;
                  </span>
                  <span className="text-[14px] font-normal text-primary opacity-50">
                    {durationValue}
                  </span>
                </FlexContainer>
              </FlexItems>
            </FlexContainer>
          </FlexItems>
          <FlexItems className="w-[50%] px-[15px] flex-grow flex-shrink-0">
            <FlexContainer className="justify-end gap-x-[18px]">
              <FlexItems>
                <FlexContainer className="items-center">
                  <FlexItems className="mr-[8px]">
                    <Button onClick={handleToggleMuteVideo}>
                      <i className="text-[22px]">
                        {isMuted ? <BiVolumeMute /> : <BiVolumeFull />}
                      </i>
                    </Button>
                  </FlexItems>
                  <FlexItems>
                    <InputSlider
                      className="max-w-[100px]"
                      borderRadius={12}
                      onChange={handleChangeVolume}
                      value={currentVolume}
                      max={1}
                      min={0}
                    />
                  </FlexItems>
                </FlexContainer>
              </FlexItems>
              <FlexItems>
                <Button onClick={handleFullScreen} title="Xem toàn màn hình">
                  <BiFullscreen className="text-[22px]" />
                </Button>
              </FlexItems>
            </FlexContainer>
          </FlexItems>
        </FlexContainer>
      </div>
    </>
  );
}

export default BarControls;
