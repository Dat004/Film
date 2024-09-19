import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import Hls from "hls.js";

import Image from "../../../../../components/Image";

function ThumbnailVideo({ className, src = "", currentTimeCapture = 0 }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    const config = {
      maxBufferLength: 60, // Tăng kích thước bộ đệm
      maxMaxBufferLength: 1200, // Tăng kích thước bộ đệm tối đa
      backBufferLength: Infinity,
      frontBufferFlushThreshold: Infinity,
      maxBufferSize: 120 * 1000 * 1000, // Tăng kích thước bộ đệm
      maxBufferHole: 0.1, // Giảm kích thước lỗ hổng bộ đệm
    };

    const hls = new Hls(config);
    const video = videoRef.current;
    hls.attachMedia(video);
    if (Hls.isSupported()) {
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.error("This device does not support HLS playback.");
      video.src = src;
    }

    return () => {
      // Unmount
      if (hls) hls.destroy();
      if (hls && video) {
        hls.detachMedia(video);
      }

      setThumbnail("");
    };
  }, [src]);

  useEffect(() => {
    const urlCapture = handleCapture(currentTimeCapture);

    setThumbnail(urlCapture)
  }, [currentTimeCapture]);

  const handleCapture = (time) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Lấy kích thước tự nhiên của video
    const naturalWidth = videoRef.current.videoWidth;
    const naturalHeight = videoRef.current.videoHeight;

    // Đặt kích thước canvas bằng kích thước tự nhiên của video
    canvasRef.current.width = naturalWidth;
    canvasRef.current.height = naturalHeight;

    video.currentTime = time;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png", 1);
  };

  const thumbnailClasses = classNames("w-[200px] h-[110px]", {
    [className]: className,
  });

  return (
    <div className={thumbnailClasses}>
      <div className="w-[100%] h-[100%]">
        {thumbnail && <Image src={thumbnail} alt="preview thumbnail" />}
      </div>
      <div className="invisible hidden w-0 h-0 opacity-0">
        <video ref={videoRef} src={src}></video>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default ThumbnailVideo;
