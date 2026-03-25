import { SkeletonTheme } from "react-loading-skeleton";
import Skeleton from "react-loading-skeleton";
import classNames from "classnames";
import "react-loading-skeleton/dist/skeleton.css";

function SkeletonContainer({
  children,
  baseColor = "var(--skeleton-base)",
  highlightColor = "var(--skeleton-highlight)",
  className,
  ...props
}) {
  const catalogSkeletonClasses = classNames("w-[100%] h-[100%] block", {
    [className]: className,
  });

  return (
    <SkeletonTheme inline baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton className={catalogSkeletonClasses} {...props}></Skeleton>
    </SkeletonTheme>
  );
}

export default SkeletonContainer;
