"use client";

import * as React from "react";
import { createPortal } from "react-dom";

interface ScreenDimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  isShow?: boolean;
}

export function ScreenDimmer({ isShow = false, ...props }: ScreenDimmerProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isShow || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1001] bg-bg-dimmer backdrop-blur-[3px] transition-opacity duration-200 ease-out cursor-pointer"
      {...props}
    />,
    document.body
  );
}

export default ScreenDimmer;
