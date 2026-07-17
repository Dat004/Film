import { useCallback, useEffect } from 'react';

import { setStatusMovie } from '../store/video-player-store';

interface UseVideoFullScreenOptions {
  videoWrapperRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isFullScreen: boolean;
}

interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  mozCancelFullScreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
}

interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
}

interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitSupportsFullscreen?: boolean;
  webkitDisplayingFullscreen?: boolean;
}

function isIosSafariLike() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return iOS;
}

function getFullscreenElement(): Element | null {
  const doc = document as ExtendedDocument;
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

function isVideoNativeFullscreen(video: ExtendedHTMLVideoElement | null) {
  return Boolean(video?.webkitDisplayingFullscreen);
}

function requestElementFullscreen(el: ExtendedHTMLElement) {
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
  if (el.msRequestFullscreen) return el.msRequestFullscreen();
  return Promise.reject(new Error('Fullscreen API unavailable'));
}

function exitDocumentFullscreen() {
  const doc = document as ExtendedDocument;
  if (!getFullscreenElement()) return;
  if (doc.exitFullscreen) return doc.exitFullscreen();
  if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
  if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
  if (doc.msExitFullscreen) return doc.msExitFullscreen();
}

/**
 * Enter/exit fullscreen. On iOS Safari, Element.requestFullscreen is unavailable for
 * arbitrary divs — must call HTMLVideoElement.webkitEnterFullscreen() inside a user gesture.
 */
export function enterVideoFullscreen(
  wrapper: HTMLDivElement | null,
  video: HTMLVideoElement | null
) {
  const v = video as ExtendedHTMLVideoElement | null;
  const w = wrapper as ExtendedHTMLElement | null;

  // iOS: native video fullscreen only (must stay in the gesture call stack)
  if (v && (isIosSafariLike() || Boolean(v.webkitSupportsFullscreen && !w?.requestFullscreen))) {
    if (typeof v.webkitEnterFullscreen === 'function') {
      try {
        v.webkitEnterFullscreen();
        return;
      } catch {
        // fall through
      }
    }
  }

  if (w) {
    void Promise.resolve(requestElementFullscreen(w)).catch(() => {
      if (v && typeof v.webkitEnterFullscreen === 'function') {
        try {
          v.webkitEnterFullscreen();
        } catch {
          /* ignore */
        }
      }
    });
    return;
  }

  if (v && typeof v.webkitEnterFullscreen === 'function') {
    try {
      v.webkitEnterFullscreen();
    } catch {
      /* ignore */
    }
  }
}

export function exitVideoFullscreen(video: HTMLVideoElement | null) {
  const v = video as ExtendedHTMLVideoElement | null;
  if (isVideoNativeFullscreen(v) && typeof v?.webkitExitFullscreen === 'function') {
    try {
      v.webkitExitFullscreen();
      return;
    } catch {
      /* fall through */
    }
  }
  void Promise.resolve(exitDocumentFullscreen()).catch(() => {});
}

export function useVideoFullScreen({
  videoWrapperRef,
  videoRef,
  isFullScreen,
}: UseVideoFullScreenOptions) {
  const syncStoreFromDom = useCallback(() => {
    const video = videoRef.current as ExtendedHTMLVideoElement | null;
    const active = Boolean(getFullscreenElement() || isVideoNativeFullscreen(video));
    setStatusMovie({ key: 'isFullScreen', value: active });
  }, [videoRef]);

  // Keep store in sync when user exits via OS gestures / native video controls
  useEffect(() => {
    const video = videoRef.current as ExtendedHTMLVideoElement | null;

    const onDocChange = () => syncStoreFromDom();
    const onWebkitBegin = () => setStatusMovie({ key: 'isFullScreen', value: true });
    const onWebkitEnd = () => setStatusMovie({ key: 'isFullScreen', value: false });

    document.addEventListener('fullscreenchange', onDocChange);
    document.addEventListener('webkitfullscreenchange', onDocChange);
    document.addEventListener('mozfullscreenchange', onDocChange);
    document.addEventListener('MSFullscreenChange', onDocChange);

    video?.addEventListener('webkitbeginfullscreen', onWebkitBegin);
    video?.addEventListener('webkitendfullscreen', onWebkitEnd);
    video?.addEventListener('webkitpresentationmodechanged', onDocChange);

    return () => {
      document.removeEventListener('fullscreenchange', onDocChange);
      document.removeEventListener('webkitfullscreenchange', onDocChange);
      document.removeEventListener('mozfullscreenchange', onDocChange);
      document.removeEventListener('MSFullscreenChange', onDocChange);
      video?.removeEventListener('webkitbeginfullscreen', onWebkitBegin);
      video?.removeEventListener('webkitendfullscreen', onWebkitEnd);
      video?.removeEventListener('webkitpresentationmodechanged', onDocChange);
    };
  }, [videoRef, syncStoreFromDom]);

  // Non-iOS: react to store flag (keyboard / programmatic). iOS enter must be gesture-direct.
  useEffect(() => {
    if (isIosSafariLike()) return;

    const wrapper = videoWrapperRef.current;
    const video = videoRef.current;
    const active = Boolean(
      getFullscreenElement() || isVideoNativeFullscreen(video as ExtendedHTMLVideoElement)
    );

    if (isFullScreen && !active) {
      enterVideoFullscreen(wrapper, video);
    } else if (!isFullScreen && active) {
      exitVideoFullscreen(video);
    }
  }, [isFullScreen, videoWrapperRef, videoRef]);
}
