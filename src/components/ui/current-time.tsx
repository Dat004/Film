import * as React from "react";

export interface CurrentTimeProps {
  className?: string;
  currentTime?: number;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;

  if (h > 0) {
    const hStr = h < 10 ? `0${h}` : `${h}`;
    return `${hStr}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

export function CurrentTime({ className = "", currentTime = 0 }: CurrentTimeProps) {
  return (
    <span className={className}>
      {formatTime(currentTime)}
    </span>
  );
}

export default CurrentTime;
