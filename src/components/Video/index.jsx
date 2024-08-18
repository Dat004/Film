import classNames from "classnames";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
// import ReactPlayer from "react-player";

import BarControls from "../../layouts/defaultComponents/Player/VideoPlayer/BarControls";
import { PlayDisabled } from "../../icons";
import {
  setStatusMovie,
  setTimeVideo,
} from "../../redux/slices/videoPlayerSlice";
import { videoPlayerSelector } from "../../redux/selectors";
import { CustomToastContainer, ToastMessage } from "../Toastify";

function Video({ className, src, handleNext = () => {}, ...props }) {
  const clickTimeoutRef = useRef(null);
  const mouseMoveTimeoutRef = useRef(null);
  const changeTimeoutRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const videoRef = useRef(null);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showController, setShowController] = useState(false);
  const [clickDetected, setClickDetected] = useState(false);

  const videoPlayerStatus = useSelector(videoPlayerSelector);
  const { statusMovie, episode } = videoPlayerStatus;
  const { currentVolume, isMuted, isPlay, autoPlay, autoNext, isFullScreen } =
    statusMovie;
  const { currentEpisode } = episode;

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
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(
          "manifest loaded, found " + data.levels.length + " quality level: ",
          data.levels
        );
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        const type = data.type;
        const fatal = data.fatal;

        if (fatal) {
          switch (type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              handleError("Gặp lỗi mạng nghiêm trọng, hãy thử khôi phục");
              // console.log(type, data);
              // hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              handleError(
                "Gặp lỗi phương tiện nghiêm trọng, hãy thử khôi phục"
              );
              // hls.swapAudioCodec();
              // hls.recoverMediaError();
              break;
            default:
              // cannot recover
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.error("This device does not support HLS playback.");
      video.src = src;

      video.addEventListener("loadedmetadata", handleStarting);
    }

    return () => {
      // Unmount
      if (hls) hls.destroy();
      if (hls && video) {
        hls.detachMedia(video);
        video.removeEventListener("loadedmetadata", handleStarting);
      }

      setIsError(false);
      setCurrentTime(0);
      setDuration(0);

      dispatch(setTimeVideo({ key: "currentTime", value: 0 }));
      dispatch(setTimeVideo({ key: "duration", value: 0 }));
    };
  }, [src]);

  useEffect(() => {
    const handleLoadeddata = () => {
      setIsError(false);
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
      } else if (videoRef.current.webkitSupportsFullscreen) {
        videoRef.current.webkitEnterFullscreen();
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

    const handleFullScreenChange = () => {
      if (
        document.fullscreenElement ||
        videoRef.current.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        dispatch(setStatusMovie({ key: "isFullScreen", value: true }));
      } else {
        dispatch(setStatusMovie({ key: "isFullScreen", value: false }));
      }
    };

    if (videoWrapperRef.current && videoRef.current) {
      if (isFullScreen) {
        enterFullScreen();
        // videoRef.current.playsInline = false;
      } else {
        exitFullScreen();
        // videoRef.current.playsInline = true;
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
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    videoRef.current.addEventListener(
      "webkitpresentationmodechanged",
      handleFullScreenChange
    );
    document.addEventListener("mozfullscreenchange", handleFullScreenChange);
    document.addEventListener("MSFullscreenChange", handleFullScreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullScreenChange
      );
    };
  }, [isFullScreen]);

  useEffect(() => {
    const video = videoRef.current;
    if (isPlay) {
      const videoPromise = video.play();
      if (videoPromise !== undefined) {
        videoPromise.then(() => {}).catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isPlay, currentEpisode]);

  useEffect(() => {
    videoRef.current.volume = currentVolume;
  }, [currentVolume]);

  const videoStyles = classNames("block w-[100%] h-[100%] select-none", {
    [className]: className,
  });

  const handleStarting = () => {
    setIsLoading(false);
    setIsError(false);
  };

  const handleExitFullScreen = () => {
    dispatch(setStatusMovie({ key: "isFullScreen", value: false }));
  };

  const handleToggleFullScreen = () => {
    if (isError) return;

    dispatch(setStatusMovie({ key: "isFullScreen", value: !isFullScreen }));
  };

  const handleTimeUpdate = (e) => {
    if (videoRef.current.readyState > 3 && isPlay) {
      setCurrentTime(+e.target.currentTime);
      dispatch(
        setTimeVideo({ key: "currentTime", value: +e.target.currentTime })
      );
    }
  };

  const handleChangeTime = (currentTimeVideo) => {
    if (isError) return;

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    setCurrentTime(currentTimeVideo);
    dispatch(setTimeVideo({ key: "currentTime", value: currentTimeVideo }));
    handleShowController();
    handleSeeking();

    changeTimeoutRef.current = setTimeout(() => {
      videoRef.current.currentTime = currentTimeVideo;

      handleSeeked();
    }, 500);
  };

  const handleTogglePlay = () => {
    if (isError) return;

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

  const handleSeeking = () => {
    dispatch(setStatusMovie({ key: "isPlay", value: false }));
  };

  const handleEndedVideo = () => {
    if (!autoNext) {
      dispatch(setStatusMovie({ key: "isPlay", value: false }));
      dispatch(setStatusMovie({ key: "isFullScreen", value: false }));

      return;
    }

    handleNext();
  };

  const handleError = (message) => {
    dispatch(setStatusMovie({ key: "isPlay", value: false }));
    setIsLoading(false);
    setIsError(true);

    ToastMessage.error(message);
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
        onLoadStart={() => setIsLoading(true)}
        onError={() => handleError("Đã có lỗi xảy ra với video!")}
        onEnded={handleEndedVideo}
        onDurationChange={(e) => {
          setDuration(e.target.duration || 0);
          dispatch(
            setTimeVideo({ key: "duration", value: e.target.duration || 0 })
          );
        }}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() =>
          dispatch(setStatusMovie({ key: "isPlay", value: true }))
        }
        onPause={() =>
          dispatch(setStatusMovie({ key: "isPlay", value: false }))
        }
        onCanPlay={handleStarting}
        onCanPlayThrough={handleStarting}
        crossOrigin="anonymous"
        muted={isMuted}
        preload="auto"
        playsInline
        {...props}
      ></video>
      <CustomToastContainer />
      {isLoading && (
        <div className="absolute flex items-center justify-center inset-0 z-[999] bg-bg-layout-loading cursor-default">
          <div className="loader"></div>
        </div>
      )}
      {isError && (
        <div className="absolute flex items-center justify-center inset-0 z-[1000] bg-bg-layout-loading cursor-default">
          <div className="max-w-[30%] flex flex-col items-center justify-center">
            <div className="size-[96px] mdm:size-[72px] text-primary">
              <PlayDisabled />
            </div>
            <span className="text-[14px] text-center text-primary whitespace-normal leading-[1.2] mt-[4px] font-normal">
              Rất tiếc vì sự cố này!
            </span>
          </div>
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
