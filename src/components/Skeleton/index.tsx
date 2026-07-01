import * as React from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import Skeleton from "react-loading-skeleton";
import { cn } from "@/lib/utils";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonContainerProps {
  children?: React.ReactNode;
  baseColor?: string;
  highlightColor?: string;
  className?: string;
  [key: string]: any;
}

export function SkeletonContainer({
  children,
  baseColor = "var(--skeleton-base)",
  highlightColor = "var(--skeleton-highlight)",
  className = "",
  ...props
}: SkeletonContainerProps) {
  const catalogSkeletonClasses = cn("w-full h-full block", {
    [className]: className,
  });

  return (
    <SkeletonTheme inline baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton className={catalogSkeletonClasses} {...props} />
    </SkeletonTheme>
  );
}

export default SkeletonContainer;
