import { FaPlay, FaPause } from "react-icons/fa";
import { cn } from "@/lib/utils";

import Button from "@/components/ui/button";

function PlayIconCustom({
  className = "",
  isPlay = false,
  widthContainer = "96px",
  heightContainer = "96px",
  ...props
}: any) {
  const iconItemStyles = cn("text-dark", {
    [className]: className,
  });

  return (
    <Button
      style={{ width: widthContainer, height: heightContainer }}
      className="bg-bg-green"
      aria-label="play-btn"
      rounded
      {...props}
    >
      {isPlay ? (
        <FaPause className={iconItemStyles} />
      ) : (
        <FaPlay className={iconItemStyles} />
      )}
    </Button>
  );
}

export default PlayIconCustom;
