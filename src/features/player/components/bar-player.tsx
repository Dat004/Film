"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  TbPlayerSkipForward,
  TbPlayerTrackNextFilled,
  TbPlayerTrackPrevFilled,
  TbRepeat,
  TbSun,
} from "react-icons/tb";

import WatchListButton from "@/components/film/WatchListButton";
import ScreenDimmer from "@/components/ui/screen-dimmer";
import Button from "@/components/ui/button";
import { usePlayerStore } from "../stores/player-store";

interface StatusProps {
  isOn?: boolean;
}

function Status({ isOn = false }: StatusProps) {
  const statusStyles = cn(
    "ml-[6px] inline-flex min-h-[1.25rem] min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-[7px] text-[11px] font-semibold leading-none tabular-nums",
    isOn
      ? "bg-[var(--status-chip-on-bg)] text-[var(--status-chip-on-fg)]"
      : "bg-[var(--status-chip-off-bg)] text-[var(--status-chip-off-fg)]"
  );

  return <span className={statusStyles}>{isOn ? "On" : "Off"}</span>;
}

interface BarPlayerProps {
  handleNext?: () => void;
  handlePrev?: () => void;
}

export function BarPlayer({ handleNext = () => {}, handlePrev = () => {} }: BarPlayerProps) {
  const isLight = usePlayerStore((state) => state.isLight);
  const autoPlay = usePlayerStore((state) => state.autoPlay);
  const autoNext = usePlayerStore((state) => state.autoNext);
  const toggleLight = usePlayerStore((state) => state.toggleLight);
  const toggleAutoPlay = usePlayerStore((state) => state.toggleAutoPlay);
  const toggleAutoNext = usePlayerStore((state) => state.toggleAutoNext);

  const handleToggleStatus = (key: "isLight" | "autoPlay" | "autoNext") => {
    if (key === "isLight") toggleLight();
    if (key === "autoPlay") toggleAutoPlay();
    if (key === "autoNext") toggleAutoNext();
  };

  const handleLightOff = () => {
    if (isLight) handleToggleStatus("isLight");
  };

  const iconSm = (isOn: boolean) =>
    cn(
      "size-[18px] shrink-0 detail769:hidden text-primary transition-opacity duration-150",
      isOn ? "opacity-100" : "opacity-[0.55]"
    );

  return (
    <div className="video-external-bar min-w-0 flex items-center justify-between gap-x-1 px-[8px] min-[480px]:px-[15px]">
      <div className="min-w-0 shrink flex items-center gap-x-1 gap-y-1 detail769:gap-x-0">
        <div className="m-0 border-0 pr-0 detail769:m-[5px] detail769:border-r detail769:border-solid detail769:border-bd-filed-form-color/25 detail769:pr-[12px]">
          <Button
            onClick={() => handleToggleStatus("isLight")}
            className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
            aria-label={isLight ? "Tắt Light" : "Bật Light"}
            title={`Light — ${isLight ? "On" : "Off"}`}
          >
            <TbSun className={iconSm(isLight)} aria-hidden />
            <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
              Light
              <Status isOn={isLight} />
            </span>
          </Button>
          <ScreenDimmer onClick={handleLightOff} isShow={isLight} />
        </div>
        <div className="m-0 border-0 pr-0 detail769:m-[5px] detail769:border-r detail769:border-solid detail769:border-bd-filed-form-color/25 detail769:pr-[12px]">
          <Button
            onClick={() => handleToggleStatus("autoPlay")}
            className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
            aria-label={autoPlay ? "Tắt Auto Play" : "Bật Auto Play"}
            title={`Auto Play — ${autoPlay ? "On" : "Off"}`}
          >
            <TbRepeat className={iconSm(autoPlay)} aria-hidden />
            <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
              Auto Play
              <Status isOn={autoPlay} />
            </span>
          </Button>
        </div>
        <div className="m-0 detail769:m-[5px]">
          <Button
            onClick={() => handleToggleStatus("autoNext")}
            className="video-external-toggle text-primary !font-medium gap-x-[2px] rounded-lg px-[3px] py-[4px] detail769:rounded-md detail769:px-[6px] detail769:py-[6px] hover:bg-bg-menu-items"
            aria-label={autoNext ? "Tắt Auto Next" : "Bật Auto Next"}
            title={`Auto Next — ${autoNext ? "On" : "Off"}`}
          >
            <TbPlayerSkipForward className={iconSm(autoNext)} aria-hidden />
            <span className="hidden items-center gap-x-[2px] text-[12px] detail769:inline-flex">
              Auto Next
              <Status isOn={autoNext} />
            </span>
          </Button>
        </div>
      </div>
      <div className="ml-auto shrink-0 flex items-center gap-x-[6px] min-[480px]:gap-x-[8px]">
        <div className="relative ssm:hidden m-[5px]">
          <WatchListButton right top />
        </div>
        <div aria-label="prev-btn" className="m-[2px] min-[480px]:m-[5px]">
          <Button onClick={handlePrev} title="Tập trước" className="px-[8px] py-[6px]">
            <TbPlayerTrackPrevFilled className="text-[18px] detail769:text-[20px]" />
          </Button>
        </div>
        <div aria-label="next-btn" className="m-[2px] min-[480px]:m-[5px]">
          <Button onClick={handleNext} title="Tập sau" className="px-[8px] py-[6px]">
            <TbPlayerTrackNextFilled className="text-[18px] detail769:text-[20px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BarPlayer;

