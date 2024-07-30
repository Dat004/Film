import classNames from "classnames";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { IoPause, IoPlay } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
// import ReactPlayer from "react-player";

import BarControls from "../../layouts/defaultComponents/Player/VideoPlayer/BarControls";
import { setStatusMovie } from "../../redux/slices/videoPlayerSlice";
import { videoPlayerSelector } from "../../redux/selectors";

function Video({ className, src, ...props }) {
  const clickTimeoutRef = useRef(null);
  const mouseMoveTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showController, setShowController] = useState(false);
  const [clickDetected, setClickDetected] = useState(false);

  const videoPlayerStatus = useSelector(videoPlayerSelector);
  const { statusMovie } = videoPlayerStatus;
  const {
    duration,
    currentTime,
    currentVolume,
    isMuted,
    isSeeked,
    isPlay,
    autoPlay,
    isFullScreen,
  } = statusMovie;

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
      autoStartLoad: true,
      startPosition: -1,
      debug: false,
      capLevelOnFPSDrop: false,
      capLevelToPlayerSize: false,
      defaultAudioCodec: undefined,
      initialLiveManifestSize: 1,
      maxBufferLength: 60, // Tăng kích thước bộ đệm
      maxMaxBufferLength: 1200, // Tăng kích thước bộ đệm tối đa
      backBufferLength: Infinity,
      frontBufferFlushThreshold: Infinity,
      maxBufferSize: 120 * 1000 * 1000, // Tăng kích thước bộ đệm
      maxBufferHole: 0.1, // Giảm kích thước lỗ hổng bộ đệm
      highBufferWatchdogPeriod: 2,
      nudgeOffset: 0.1,
      nudgeMaxRetry: 3,
      maxFragLookUpTolerance: 0.25,
      liveSyncDurationCount: 3,
      liveSyncOnStallIncrease: 1,
      liveMaxLatencyDurationCount: Infinity,
      liveDurationInfinity: false,
      preferManagedMediaSource: false,
      enableWorker: true,
      enableSoftwareAES: true,
      fragLoadPolicy: {
        default: {
          maxTimeToFirstByteMs: 5000, // Giảm thời gian tối đa để nhận byte đầu tiên
          maxLoadTimeMs: 50000, // Giảm thời gian tải tối đa
          timeoutRetry: {
            maxNumRetry: 5, // Tăng số lần thử lại khi hết thời gian chờ
            retryDelayMs: 500,
            maxRetryDelayMs: 2000,
          },
          errorRetry: {
            maxNumRetry: 10, // Tăng số lần thử lại khi gặp lỗi
            retryDelayMs: 1000,
            maxRetryDelayMs: 5000,
            backoff: "linear",
          },
        },
      },
      startLevel: undefined,
      startFragPrefetch: false,
      testBandwidth: true, // Bật kiểm tra băng thông
      progressive: false,
      lowLatencyMode: true, // Bật chế độ độ trễ thấp
      fpsDroppedMonitoringPeriod: 5000,
      fpsDroppedMonitoringThreshold: 0.2,
      appendErrorMaxRetry: 5,
      enableDateRangeMetadataCues: true,
      enableEmsgMetadataCues: true,
      enableID3MetadataCues: true,
      enableWebVTT: true,
      enableIMSC1: true,
      enableCEA708Captions: true,
      stretchShortVideoTrack: false,
      maxAudioFramesDrift: 1,
      forceKeyFrameOnDiscontinuity: true,
      abrEwmaFastLive: 3.0,
      abrEwmaSlowLive: 9.0,
      abrEwmaFastVoD: 3.0,
      abrEwmaSlowVoD: 9.0,
      abrEwmaDefaultEstimate: 500000,
      abrEwmaDefaultEstimateMax: 5000000,
      abrBandWidthFactor: 0.95,
      abrBandWidthUpFactor: 0.7,
      abrMaxWithRealBitrate: false,
      maxStarvationDelay: 4,
      maxLoadingDelay: 4,
      minAutoBitrate: 0,
      emeEnabled: false,
      licenseXhrSetup: undefined,
      drmSystems: {},
      drmSystemOptions: {},
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

    return () => {
      if (hls) {
        hls.destroy();
      }

      dispatch(setStatusMovie({ key: "isPlay", value: false }));
    };
  }, [src]);

  useEffect(() => {
    if (isSeeked) {
      videoRef.current.currentTime = currentTime;
    }
  }, [isSeeked, currentTime]);

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
      dispatch(
        setStatusMovie({ key: "duration", value: videoRef.current.duration })
      );
    };

    videoRef.current.addEventListener("loadeddata", handleLoadeddata);

    return () => {
      if (videoRef.current) {
        videoRef.current.addEventListener("loadeddata", handleLoadeddata);
      }
    };
  }, []);

  useEffect(() => {
    videoRef.current.volume = currentVolume;
  }, [currentVolume]);

  const videoStyles = classNames("block w-[100%] h-[100%] select-none", {
    [className]: className,
  });

  const handleTimeUpdate = (e) => {
    dispatch(
      setStatusMovie({ key: "currentTime", value: e.target.currentTime })
    );
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

  return (
    <div
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
      className="relative w-[100%] h-[100%]"
    >
      <video
        ref={videoRef}
        className={videoStyles}
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        crossOrigin="anonymous"
        muted={isMuted}
        preload="auto"
        playsInline
        {...props}
      ></video>
      {isLoading && (
        <div className="absolute flex items-center justify-center inset-0 z-[999] bg-bg-layout-loading pointer-events-none">
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
        className="absolute bottom-0 left-0 w-[100%] h-[20%] mdm:h-[55px] flex items-end z-[150] overflow-hidden"
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
          />
        </motion.div>
      </div>
    </div>
  );
}

export default Video;
