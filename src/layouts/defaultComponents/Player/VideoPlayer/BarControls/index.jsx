import { IoPlay, IoPause } from "react-icons/io5";
import { BiFullscreen } from "react-icons/bi";
import { BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import { setStatusMovie } from "../../../../../redux/slices/videoPlayerSlice";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import InputSlider from "../../../../../components/InputSlider";
import Button from "../../../../../components/Button";
import { useVideoTime } from "../../../../../hooks";
import { videoPlayerSelector } from "../../../../../redux/selectors";

function BarControls({
  handlePlay = () => {},
  handleChangeTime = () => {},
  handleFullScreen = () => {},
}) {
  const dispatch = useDispatch();

  const {
    time: { currentTime, duration },
    statusMovie: { isPlay, isMuted, currentVolume },
  } = useSelector(videoPlayerSelector);

  const currentTimeValue = useVideoTime(currentTime);
  const durationValue = useVideoTime(duration);

  const handleChangeVolume = (currentVolume) => {
    dispatch(
      setStatusMovie({
        key: "isMuted",
        value: currentVolume !== 0 ? false : true,
      })
    );
    dispatch(setStatusMovie({ key: "currentVolume", value: currentVolume }));
  };

  const handleToggleMuteVideo = () => {
    dispatch(setStatusMovie({ key: "currentVolume", value: !isMuted ? 0 : 1 }));
    dispatch(setStatusMovie({ key: "isMuted", value: !isMuted }));
  };

  return (
    <>
      <div className="w-[100%]">
        <InputSlider
          value={currentTime}
          min={0}
          max={duration}
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
