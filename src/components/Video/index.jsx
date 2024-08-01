import classNames from "classnames";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
// import ReactPlayer from "react-player";

import BarControls from "../../layouts/defaultComponents/Player/VideoPlayer/BarControls";
import {
  setStatusMovie,
  resetStatus,
} from "../../redux/slices/videoPlayerSlice";
import { videoPlayerSelector } from "../../redux/selectors";

function Video({ className, src, ...props }) {
  const clickTimeoutRef = useRef(null);
  const mouseMoveTimeoutRef = useRef(null);
  const changeTimeoutRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const videoRef = useRef(null);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showController, setShowController] = useState(false);
  const [clickDetected, setClickDetected] = useState(false);

  const videoPlayerStatus = useSelector(videoPlayerSelector);
  const { statusMovie } = videoPlayerStatus;
  const { currentVolume, isMuted, isPlay, autoPlay, isFullScreen } =
    statusMovie;

  const controllerVariants = {
    hide: {
      translateY: "100%",
      opacity: 0,
    },
    show: {
      translateY: 0,
      opacity: 1,
    },
  };

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
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const availableQualities = data?.map((level) => {
          return {
            bitrate: level.bitrate,
            resolution: level.width + "x" + level.height,
            url: level.url,
          };
        });

        console.log("availableQualities: ", availableQualities);
        console.log("is loading");
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        const type = data.type;
        const fatal = data.fatal;

        if (fatal) {
          switch (type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log("fatal network error encountered, try to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("fatal media error encountered, try to recover");
              hls.swapAudioCodec();
              hls.recoverMediaError();
              break;
            default:
              // cannot recover
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    setCurrentTime(0);
    setDuration(0);

    return () => {
      if (hls) {
        hls.destroy();
      }

      dispatch(resetStatus());
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (isPlay || autoPlay) {
      const videoPromise = video.play();
      if (videoPromise !== undefined) {
        videoPromise
          .then(() => {})
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      video.pause();
    }
  }, [isPlay, autoPlay]);

  useEffect(() => {
    const handleLoadeddata = () => {
      setDuration(+videoRef.current.duration);
    };

    videoRef.current.addEventListener("loadedmetadata", handleLoadeddata);

    return () => {
      if (videoRef.current) {
        videoRef.current.addEventListener("loadedmetadata", handleLoadeddata);
      }
    };
  }, []);

  useEffect(() => {
    const enterFullScreen = () => {
      if (videoWrapperRef.current.requestFullscreen) {
        videoWrapperRef.current.requestFullscreen();
      } else if (videoWrapperRef.current.webkitEnterFullscreen) {
        videoWrapperRef.current.webkitEnterFullscreen();
      } else if (videoWrapperRef.current.mozRequestFullScreen) {
        videoWrapperRef.current.mozRequestFullScreen();
      } else if (videoWrapperRef.current.webkitRequestFullscreen) {
        videoWrapperRef.current.webkitRequestFullscreen();
      } else if (videoWrapperRef.current.msRequestFullscreen) {
        videoWrapperRef.current.msRequestFullscreen();
      }
    };

    const exitFullScreen = () => {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };

    if (videoWrapperRef.current) {
      if (isFullScreen) {
        enterFullScreen();
      } else {
        exitFullScreen();
      }
    }

    const handleKeyDown = (e) => {
      if (e.which === 13 || e.which === 122) {
        e.preventDefault();

        handleToggleFullScreen();
      } else if (e.which === 27) {
        e.preventDefault();

        handleExitFullScreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  useEffect(() => {
    videoRef.current.volume = currentVolume;
  }, [currentVolume]);

  const videoStyles = classNames("block w-[100%] h-[100%] select-none", {
    [className]: className,
  });

  const handleFullScreen = () => {
    dispatch(setStatusMovie({ key: "isFullScreen", value: true }));
  };

  const handleExitFullScreen = () => {
    dispatch(setStatusMovie({ key: "isFullScreen", value: false }));
  };

  const handleToggleFullScreen = () => {
    dispatch(setStatusMovie({ key: "isFullScreen", value: !isFullScreen }));
  };

  const handleTimeUpdate = (e) => {
    if (videoRef.current.readyState > 3 && isPlay) {
      setCurrentTime(+e.target.currentTime);
    }
  };

  const handleChangeTime = (e, currentTimeVideo) => {
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    setCurrentTime(currentTimeVideo);
    handleShowController();
    handleSeeking();

    changeTimeoutRef.current = setTimeout(() => {
      videoRef.current.currentTime = currentTimeVideo;

      handleSeeked();
    }, 500);
  };

  const handleTogglePlay = () => {
    dispatch(setStatusMovie({ key: "isPlay", value: !isPlay }));
  };

  const handleShowController = () => {
    setShowController(true);
  };

  const handleHideController = () => {
    setShowController(false);
  };

  const handleCheckMousePointerPosition = () => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    setShowController(true);

    mouseMoveTimeoutRef.current = setTimeout(() => {
      handleHideController();
    }, 2500); // 1 giây
  };

  const handleClickInside = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    handleTogglePlay();
    setClickDetected(true);

    clickTimeoutRef.current = setTimeout(() => {
      setClickDetected(false);
    }, 1000); // 1 giây
  };

  const handleSeeked = () => {
    dispatch(setStatusMovie({ key: "isPlay", value: true }));
    setIsLoading(true);
  };

  const handleSeeking = (e) => {
    console.log("seeking", e);
    dispatch(setStatusMovie({ key: "isPlay", value: false }));
  };

  return (
    <div
      ref={videoWrapperRef}
      onClick={handleClickInside}
      onTouchStart={handleCheckMousePointerPosition}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          handleShowController();
        }
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") {
          handleCheckMousePointerPosition();
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          handleHideController();
        }
      }}
      className="video-wrapper relative w-[100%] h-[100%]"
    >
      <video
        ref={videoRef}
        className={videoStyles}
        onPlaying={() =>
          dispatch(setStatusMovie({ key: "isPlay", value: true }))
        }
        onPause={() =>
          dispatch(setStatusMovie({ key: "isPlay", value: false }))
        }
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={() => setIsLoading(true)}
        onWaiting={() => setIsLoading(true)}
        onCanPlayThrough={() => setIsLoading(false)}
        crossOrigin="anonymous"
        muted={isMuted}
        preload="auto"
        // playsInline
        {...props}
      ></video>
      {isLoading && (
        <div className="absolute flex items-center justify-center inset-0 z-[999] bg-bg-layout-loading cursor-default">
          <div className="loader"></div>
        </div>
      )}
      <div className="absolute flex items-center justify-center inset-0 z-[100]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            clickDetected
              ? { opacity: 1, scale: 1 }
              : { scale: 1.85, opacity: 0 }
          }
          className="w-[80px] h-[80px] flex items-center justify-center bg-bg-layer-btn rounded-[50%] opacity-85"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={clickDetected ? { opacity: 1 } : { opacity: 0 }}
          className="absolute"
        >
          <i className="text-[36px] text-primary">
            {!isPlay ? <IoPlay className="ml-[4px]" /> : <IoPause />}
          </i>
        </motion.div>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="controls absolute bottom-0 left-0 w-[100%] h-[20%] mdm:h-[60px] flex items-end z-[2147483647] overflow-hidden"
      >
        <motion.div
          variants={controllerVariants}
          initial="hide"
          animate={showController ? "show" : "hide"}
          transition={{
            duration: 0.45,
            type: "tween",
            damping: 10,
            stiffness: 100,
          }}
          className="w-[100%] bg-bg-bar-controls"
        >
          <BarControls
            duration={duration}
            currentTime={currentTime}
            currentVolume={currentVolume}
            isPlay={isPlay}
            isMuted={isMuted}
            handlePlay={handleTogglePlay}
            handleChangeTime={handleChangeTime}
            handleFullScreen={handleToggleFullScreen}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Video;
