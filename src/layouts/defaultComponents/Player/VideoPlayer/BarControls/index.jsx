import { useRef, useState } from "react";
import { IoPlay, IoPause } from "react-icons/io5";
import { BiFullscreen, BiVolumeFull, BiVolumeMute } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";

import { setStatusMovie } from "../../../../../redux/slices/videoPlayerSlice";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import { videoPlayerSelector } from "../../../../../redux/selectors";
import RangeSlider from "../../../../../components/RangeSlider";
import Button from "../../../../../components/Button";
import { useVideoTime } from "../../../../../hooks";

function BarControls({
  handlePlay = () => {},
  handleChangeTime = () => {},
  handleFullScreen = () => {},
}) {
  const [currentTimeCapture, setCurrentTimeCapture] = useState(0);

  const previewThumbnailRef = useRef();
  const dispatch = useDispatch();

  const {
    time: { currentTime, duration },
    statusMovie: { isPlay, isMuted, currentVolume },
  } = useSelector(videoPlayerSelector);

  const currentTimeValue = useVideoTime(currentTime);
  const currentTimeSeek = useVideoTime(currentTimeCapture);
  const durationValue = useVideoTime(duration);

  const handleMouseMove = (e, currentValue) => {
    const position =
      e.clientX -
      e.target.getBoundingClientRect().left -
      previewThumbnailRef.current.getBoundingClientRect().width / 2;
    previewThumbnailRef.current.style.transform = `translateX(${position}px)`;

    setCurrentTimeCapture(currentValue);
  };

  const handleChangeVolume = (_, currentVolume) => {
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
      <div className="group/slider relative w-[100%] mt-[-7px]">
        <RangeSlider
          max={duration}
          borderRadius={0}
          value={currentTime}
          onMove={handleMouseMove}
          onChange={handleChangeTime}
        />
        <div
          className="absolute bottom-[calc(100%+10px)] opacity-0 will-change-[transform] translate-x-[-50%] group-hover/slider:opacity-100"
          ref={previewThumbnailRef}
        >
          <span className="bg-bg-layer-btn min-w-[34px] px-[10px] py-[6px] rounded-[4px] text-[14px] font-normal text-primary">
            {currentTimeSeek}
          </span>
        </div>
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
                    <RangeSlider
                      className="flex-grow min-w-[100px]"
                      borderRadius={6}
                      onChange={handleChangeVolume}
                      value={currentVolume}
                      max={1}
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
