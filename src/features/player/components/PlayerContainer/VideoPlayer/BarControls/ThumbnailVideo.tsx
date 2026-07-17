'use client';

import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import {
  HLS_PREVIEW_CONFIG,
  HLS_PREVIEW_HEIGHT,
  HLS_PREVIEW_SEEK_DEBOUNCE_MS,
  HLS_PREVIEW_WIDTH,
} from '../../../../constants/hls.constants';
import {
  canPlayNativeHls,
  createHlsInstance,
  destroyHlsInstance,
  isHlsJsSupported,
  Hls as HlsClass,
} from '../../../../services/hls.factory';

export interface ThumbnailVideoProps {
  className?: string;
  src?: string;
  currentTimeCapture?: number;
}

const ThumbnailVideo: React.FC<ThumbnailVideoProps> = ({
  className,
  src = '',
  currentTimeCapture = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekTokenRef = useRef(0);
  const readyRef = useRef(false);

  const [thumbnail, setThumbnail] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    readyRef.current = false;
    setIsReady(false);
    setThumbnail('');

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    let hls: ReturnType<typeof createHlsInstance> | null = null;
    let cancelled = false;

    const markReady = () => {
      if (cancelled) return;
      readyRef.current = true;
      setIsReady(true);
    };

    if (isHlsJsSupported()) {
      hls = createHlsInstance(HLS_PREVIEW_CONFIG);
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(HlsClass.Events.MANIFEST_PARSED, markReady);
      hls.on(HlsClass.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) hls?.startLoad();
        else if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) hls?.recoverMediaError();
      });
    } else if (canPlayNativeHls(video)) {
      video.src = src;
      video.addEventListener('loadedmetadata', markReady, { once: true });
    }

    return () => {
      cancelled = true;
      readyRef.current = false;
      destroyHlsInstance(hls);
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady || !src) return;

    const token = ++seekTokenRef.current;
    const target = Math.max(0, currentTimeCapture);

    const timer = window.setTimeout(() => {
      if (token !== seekTokenRef.current) return;

      const paint = () => {
        if (token !== seekTokenRef.current) return;
        if (!video.videoWidth || !video.videoHeight) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = HLS_PREVIEW_WIDTH;
        canvas.height = HLS_PREVIEW_HEIGHT;
        ctx.clearRect(0, 0, HLS_PREVIEW_WIDTH, HLS_PREVIEW_HEIGHT);

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const scale = Math.max(HLS_PREVIEW_WIDTH / vw, HLS_PREVIEW_HEIGHT / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (HLS_PREVIEW_WIDTH - dw) / 2;
        const dy = (HLS_PREVIEW_HEIGHT - dh) / 2;

        try {
          ctx.drawImage(video, dx, dy, dw, dh);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          if (token === seekTokenRef.current && dataUrl.startsWith('data:image')) {
            setThumbnail(dataUrl);
          }
        } catch {
          /* CORS-tainted */
        }
      };

      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        requestAnimationFrame(() => requestAnimationFrame(paint));
      };

      video.addEventListener('seeked', onSeeked);

      try {
        if (Math.abs(video.currentTime - target) < 0.05) {
          video.removeEventListener('seeked', onSeeked);
          paint();
        } else {
          video.currentTime = target;
        }
      } catch {
        video.removeEventListener('seeked', onSeeked);
      }
    }, HLS_PREVIEW_SEEK_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentTimeCapture, isReady, src]);

  return (
    <div className={cn('relative overflow-hidden bg-white/[0.06]', className)}>
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- data-URL preview frame
        <img src={thumbnail} alt="" draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-white/[0.08]" />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0"
      >
        <video ref={videoRef} muted playsInline preload="auto" />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default ThumbnailVideo;
