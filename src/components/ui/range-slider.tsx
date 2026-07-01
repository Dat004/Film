"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  textValue?: string;
  borderRadius?: number;
  min?: number;
  max?: number;
  yAxis?: boolean;
  disabled?: boolean;
  onChange?: (e: React.PointerEvent<HTMLDivElement>, value: number) => void;
  onMove?: (e: React.PointerEvent<HTMLDivElement>, value: number) => void;
}

export function RangeSlider({
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
}: RangeSliderProps) {
  const progressRef = React.useRef<HTMLDivElement | null>(null);
  const sliderRef = React.useRef<HTMLDivElement | null>(null);
  const thumbRef = React.useRef<HTMLDivElement | null>(null);

  const [isSeeking, setIsSeeking] = React.useState(false);

  React.useEffect(() => {
    const handlePointerUp = (e: PointerEvent) => {
      handleCancelSeeking();
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  React.useEffect(() => {
    if (sliderRef.current && progressRef.current && thumbRef.current) {
      const percentage = max > 0 ? (value / max) * 100 : 0;
      progressRef.current.style.width = !yAxis ? `${percentage}%` : "100%";
      progressRef.current.style.height = !yAxis ? "100%" : `${percentage}%`;

      const rect = progressRef.current.getBoundingClientRect();
      const position = !yAxis ? rect.width : rect.height;
      const thumbSize = !yAxis 
        ? thumbRef.current.getBoundingClientRect().width 
        : thumbRef.current.getBoundingClientRect().height;

      thumbRef.current.style.transform = !yAxis
        ? `translate(${position - thumbSize / 2}px, -50%)`
        : `translate(-50%, ${-(position - thumbSize / 2)}px)`;
    }
  }, [value, max, yAxis]);

  const sliderWrapperClasses = cn(
    "relative justify-center items-center flex group/wrapperSlider pointer-events-auto cursor-pointer select-none",
    {
      [className || ""]: className,
      "w-[100%] h-[20px]": !yAxis,
      "w-[100%] h-[150px]": yAxis,
    }
  );
  
  const thumbClasses = cn(
    "absolute opacity-0 group-hover/wrapperSlider:opacity-100 transition-opacity duration-[250ms] bg-white size-[14px] pointer-events-none z-[5] rounded-full",
    {
      "will-change-[transform] top-[50%] left-0 translate-y-[-50%]": !yAxis,
      "will-change-[transform] left-[50%] bottom-0 translate-x-[-50%]": yAxis,
    }
  );

  const sliderClasses = cn(
    "relative justify-center items-center flex group/slider w-[100%] h-[100%] z-[2] pointer-events-auto",
    {
      [className || ""]: className,
    }
  );

  const trackClasses = cn(
    "relative bg-bg-slider-color pointer-events-none",
    {
      "h-[5px] group-hover/slider:h-[8px] transition-[height] duration-[100ms] w-[100%]": !yAxis,
      "w-[5px] group-hover/slider:w-[8px] transition-[width] duration-[100ms] h-[100%]": yAxis,
    }
  );

  const progressClasses = cn(
    "absolute bottom-0 left-0 bg-bg-process-slider-color",
    {
      "will-change-[width] h-[100%]": !yAxis,
      "will-change-[height] w-[100%]": yAxis,
    }
  );

  const handleGetPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sliderRef.current || !thumbRef.current || !progressRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();

    const position = !yAxis ? e.clientX - rect.left : rect.bottom - e.clientY;
    const length = !yAxis ? rect.width : rect.height;
    const percentageValue = length > 0 ? Math.round((position / length) * 100) : 0;
    const currentValue = Math.max(min, Math.min(max, (max / 100) * percentageValue));

    if (isSeeking) {
      const thumbSize = !yAxis 
        ? thumbRef.current.getBoundingClientRect().width 
        : thumbRef.current.getBoundingClientRect().height;
      thumbRef.current.style.transform = !yAxis
        ? `translate(${position - thumbSize / 2}px, -50%)`
        : `translate(-50%, ${-(position - thumbSize / 2)}px)`;

      progressRef.current.style.width = !yAxis ? `${percentageValue}%` : "100%";
      progressRef.current.style.height = !yAxis ? "100%" : `${percentageValue}%`;

      onChange(e, currentValue);
    }
    onMove(e, currentValue);
  };

  const handleSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleGetPosition(e);
  };

  const handleSeeking = (e: React.PointerEvent<HTMLDivElement>) => {
    handleGetPosition(e);
  };

  const handleSeeked = (e: React.PointerEvent<HTMLDivElement>) => {
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
