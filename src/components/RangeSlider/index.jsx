import { useState, useRef, useEffect } from "react";
import classNames from "classnames";

function RangeSlider({
  className,
  value = 0,
  textValue = "",
  borderRadius = 2,
  min = 0,
  max = 300,
  yAxis = false,
  disabled = false,
  onChange = () => {},
  onMove = () => {},
  ...props
}) {
  const progressRef = useRef(null);
  const sliderRef = useRef(null);
  const thumbRef = useRef(null);

  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    // let seeking = false;
    // const handlePointerMove = (e) => {
    //   if (seeking) handleSeeking(e);
    // };
    // const handlePointerDown = (e) => {
    //   seeking = true;

    //   handleSeek(e);
    // };
    const handlePointerUp = (e) => {
      // seeking = false;

      handleCancelSeeking(e);
    };

    window.addEventListener("pointerup", handlePointerUp);
    // window.addEventListener("pointerdown", handlePointerDown);
    // window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
      // window.removeEventListener("pointerdown", handlePointerDown);
      // window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  const sliderWrapperClasses = classNames(
    "relative justify-center items-center flex group/wrapperSlider pointer-events-auto cursor-pointer select-none",
    {
      [className]: className,
      "w-[100%] h-[20px]": !yAxis,
      "w-[100%] h-[150px]": yAxis,
    }
  );
  const thumbClasses = classNames(
    "absolute opacity-0 group-hover/wrapperSlider:opacity-100 transition-opacity duration-[250ms] bg-bg-white size-[14px] pointer-events-none z-[5] rounded-full",
    {
      "will-change-[transform] top-[50%] left-0 translate-y-[-50%]": !yAxis,
      "will-change-[transform] left-[50%] bottom-0 translate-x-[-50%]": yAxis,
    }
  );
  const sliderClasses = classNames(
    "relative justify-center items-center flex group/slider w-[100%] h-[100%] z-[2] pointer-events-auto",
    {
      [className]: className,
    }
  );
  const trackClasses = classNames(
    "relative bg-bg-slider-color pointer-events-none",
    {
      "h-[5px] group-hover/slider:h-[8px] transition-[height] duration-[100ms] w-[100%]":
        !yAxis,
      "w-[5px] group-hover/slider:w-[8px] transition-[width] duration-[100ms] h-[100%]":
        yAxis,
    }
  );
  const progressClasses = classNames(
    "absolute bottom-0 left-0 bg-bg-process-slider-color",
    {
      "will-change-[width] h-[100%]": !yAxis,
      "will-change-[height] w-[100%]": yAxis,
    }
  );

  const handleGetPosition = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();

    const position = !yAxis ? e.clientX - rect.left : rect.bottom - e.clientY;
    const percentageValue = !yAxis
      ? Math.round((position / rect.width) * 100)
      : Math.floor((position / rect.height) * 100);
    const currentValue = Math.max(
      min,
      Math.min(max, (max / 100) * percentageValue)
    );

    if (isSeeking) {
      thumbRef.current.style.transform = !yAxis
        ? `translate(${
            position - thumbRef.current.getBoundingClientRect().width / 2
          }px, -50%)`
        : `translate(-50%, ${-(
            position -
            thumbRef.current.getBoundingClientRect().height / 2
          )}px)`;
      progressRef.current.style = !yAxis
        ? `width: ${percentageValue}%`
        : `height: ${percentageValue}%`;

      onChange(e, currentValue);
    }
    onMove(e, currentValue);
  };

  const handleSeek = (e) => {
    setIsSeeking(true);

    handleGetPosition(e);
  };

  const handleSeeking = (e) => {
    handleGetPosition(e);
  };

  const handleSeeked = (e) => {
    setIsSeeking(false);

    handleGetPosition(e);
  };

  const handleCancelSeeking = () => {
    setIsSeeking(false);
  };

  return (
    <div
      ref={sliderRef}
      role="slider"
      className={sliderWrapperClasses}
      aria-valuenow={value}
      aria-valuetext={textValue}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-disabled={disabled}
      aria-orientation={yAxis ? "vertical" : "horizontal"}
      onPointerDown={handleSeek}
      onPointerMove={handleSeeking}
      onPointerUp={handleSeeked}
      onPointerCancel={handleCancelSeeking}
      {...props}
    >
      <div ref={thumbRef} className={thumbClasses}></div>
      <div className={sliderClasses}>
        <div
          style={{ borderRadius: `${borderRadius}px` }}
          className={trackClasses}
        >
          <div ref={progressRef} className={progressClasses}></div>
        </div>
      </div>
    </div>
  );
}

export default RangeSlider;
