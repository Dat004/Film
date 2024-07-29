import { useEffect, useState } from "react";

const useVideoTime = (videoTime) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const h = Math.floor(videoTime / 3600)
        .toString()
        .padStart(2, "0"),
      m = Math.floor((videoTime % 3600) / 60)
        .toString()
        .padStart(2, "0"),
      s = Math.floor(videoTime % 60)
        .toString()
        .padStart(2, "0"),
      time = h > 0 ? h + ":" + m + ":" + s : m + ":" + s;

    setTime(time);
  }, [videoTime]);

  return time;
};

export default useVideoTime;
