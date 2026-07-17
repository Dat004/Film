'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';

import Button from '@/components/ui/Button';
import { CustomToastContainer } from '@/components/ui/Toastify';
import {
  usePreviewFilmStore,
  setShowPreview,
  scheduleHidePreview,
  cancelHidePreview,
  PreviewFilmElement,
} from '@/features/film';
import { BackToTopIcon } from '@/icons';

const GlobalUI: React.FC = () => {
  const [isShowBtnBackToTop, setIsShowBtnBackToTop] = useState(false);
  const [isTouchPreview, setIsTouchPreview] = useState(false);

  const isShowPreview = usePreviewFilmStore((state) => state.isShowPreview);
  const currentPreviewData = usePreviewFilmStore((state) => state.currentPreviewData);
  const anchorRect = usePreviewFilmStore((state) => state.anchorRect);
  const previewRequestId = usePreviewFilmStore((state) => state.previewRequestId);
  const isPreviewLoading = usePreviewFilmStore((state) => state.isPreviewLoading);

  const handleScroll = () => {
    if (window.scrollY >= 20) {
      setIsShowBtnBackToTop(true);
      return;
    }
    setIsShowBtnBackToTop(false);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sync = () => {
      const coarse =
        window.matchMedia('(hover: none)').matches ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchPreview(coarse || window.innerWidth <= 768);
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  useEffect(() => {
    if (!isShowPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPreview(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isShowPreview]);

  // Prevent background scrolling while the mobile preview is open.
  useEffect(() => {
    if (!isShowPreview || !isTouchPreview) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isShowPreview, isTouchPreview]);

  const handleMouseEnter = useCallback(() => {
    cancelHidePreview();
    setShowPreview(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isTouchPreview) return;
    scheduleHidePreview();
  }, [isTouchPreview]);

  const handleDismiss = useCallback(() => {
    setShowPreview(false);
  }, []);

  const memorizedPreview = useMemo(
    () => (
      <PreviewFilmElement
        key={`${previewRequestId}-${isPreviewLoading ? 'loading' : 'ready'}`}
        data={currentPreviewData}
        anchorRect={anchorRect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed z-[100] w-[min(320px,calc(100vw-24px))] pointer-events-auto"
      />
    ),
    [
      currentPreviewData,
      anchorRect,
      handleMouseEnter,
      handleMouseLeave,
      previewRequestId,
      isPreviewLoading,
    ]
  );

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isShowPreview && isTouchPreview ? (
        <button
          type="button"
          aria-label="Đóng xem trước"
          className="fixed inset-0 z-[99] border-0 bg-black/55 backdrop-blur-[2px]"
          onClick={handleDismiss}
        />
      ) : null}
      {isShowPreview && memorizedPreview}
      {isShowBtnBackToTop && (
        <div className="fixed right-[11.5%] bottom-[5%] z-[400]">
          <Button onClick={handleScrollToTop}>
            <BackToTopIcon />
          </Button>
        </div>
      )}
      <CustomToastContainer />
    </>
  );
};

export default GlobalUI;
