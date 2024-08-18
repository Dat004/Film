import classNames from "classnames";

import { useVideoTime } from "../../hooks";

function CurrentTime({ className, currentTime = 0 }) {
  const time = useVideoTime(currentTime);

  const timeClasses = classNames("text-[12px] text-title font-medium", {
    [className]: className,
  });

  return <p className={timeClasses}>{time}</p>;
}

export default CurrentTime;
