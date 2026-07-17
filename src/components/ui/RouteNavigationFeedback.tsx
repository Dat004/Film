'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { subscribeRouteNavigationStart } from '@/lib/route-navigation';

const MAX_PROGRESS_WHILE_PENDING = 92;
const HINT_DELAY_MS = 420;
/** Maximum wait when the route signature does not update. */
const FAILSAFE_MS = 6000;

const isModifiedEvent = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const isSamePath = (a: URL, b: URL) => a.pathname === b.pathname && a.search === b.search;

const windowRouteSignature = () =>
  `${window.location.pathname}?${window.location.search.replace(/^\?/, '')}`;

const RouteNavigationFeedback: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeSignature = useMemo(
    () => `${pathname}?${searchParams?.toString() ?? ''}`,
    [pathname, searchParams]
  );

  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const progressTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);
  const startFromRouteRef = useRef(routeSignature);
  const routeSignatureRef = useRef(routeSignature);
  const navigatingRef = useRef(false);

  routeSignatureRef.current = routeSignature;

  const clearTimers = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    if (hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    if (failsafeTimerRef.current) {
      window.clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  };

  const finishNavigation = () => {
    clearTimers();
    setProgress(100);
    setShowHint(false);
    finishTimerRef.current = window.setTimeout(() => {
      navigatingRef.current = false;
      setIsNavigating(false);
      setProgress(0);
    }, 220);
  };

  /**
   * @param fromRoute Route signature before navigation.
   * Omit for click navigation; pass the previous React route for popstate.
   */
  const beginNavigation = (fromRoute?: string) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    clearTimers();
    startFromRouteRef.current = fromRoute ?? windowRouteSignature();
    setIsNavigating(true);
    setShowHint(false);
    setProgress(12);

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= MAX_PROGRESS_WHILE_PENDING) return prev;
        const remaining = MAX_PROGRESS_WHILE_PENDING - prev;
        return prev + Math.max(1.2, remaining * 0.08);
      });
    }, 160);

    hintTimerRef.current = window.setTimeout(() => {
      setShowHint(true);
    }, HINT_DELAY_MS);

    failsafeTimerRef.current = window.setTimeout(() => {
      if (navigatingRef.current) finishNavigation();
    }, FAILSAFE_MS);
  };

  useEffect(() => {
    const handleClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);

      if (nextUrl.origin !== currentUrl.origin || isSamePath(nextUrl, currentUrl)) return;
      beginNavigation();
    };

    // Popstate updates location before React renders the destination.
    const handlePopState = () => beginNavigation(routeSignatureRef.current);

    const unsubscribe = subscribeRouteNavigationStart(() => {
      beginNavigation(routeSignatureRef.current);
    });

    document.addEventListener('click', handleClickCapture, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClickCapture, true);
      window.removeEventListener('popstate', handlePopState);
      unsubscribe();
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isNavigating) return;
    if (routeSignature === startFromRouteRef.current) return;
    finishNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating, routeSignature]);

  return (
    <>
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[2147483645] ${
          isNavigating ? 'pointer-events-auto cursor-progress' : 'pointer-events-none'
        }`}
      />

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-hidden={!isNavigating && progress === 0}
        className={`fixed left-0 top-0 z-[2147483646] h-[3px] w-full overflow-hidden bg-transparent transition-opacity duration-200 ${
          isNavigating || progress > 0 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full origin-left bg-[var(--hover-color)] shadow-[0_0_12px_color-mix(in_srgb,var(--hover-color)_70%,transparent)] transition-[transform] duration-150 ease-out"
          style={{ transform: `scaleX(${Math.min(progress, 100) / 100})` }}
        />
      </div>

      {showHint ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-[18px] z-[2147483647] -translate-x-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-bd-filed-form-color bg-bg-sidebar/95 px-3.5 py-1.5 text-[12px] font-medium text-primary shadow-lg backdrop-blur-md">
            <span
              className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-[var(--hover-color)] border-t-transparent"
              aria-hidden
            />
            Đang chuyển trang…
          </div>
        </div>
      ) : null}
    </>
  );
};

export default RouteNavigationFeedback;
