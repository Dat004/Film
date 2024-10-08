import { FaPlay, FaPause } from "react-icons/fa";
import classNames from "classnames";

import Button from "../components/Button";

function PlayIconCustom({
  className,
  isPlay = false,
  widthContainer = "96px",
  heightContainer = "96px",
  ...props
}) {
  const iconItemStyles = classNames("text-dark", {
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
