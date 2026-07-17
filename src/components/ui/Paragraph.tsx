'use client';

import React, { useRef, useEffect, useState } from 'react';

import Button from '@/components/ui/Button';
import { useControlModal } from '@/hooks';
import { cn } from '@/lib/utils';

import ContentModal from './ContentModal';

export interface ParagraphProps {
  children?: React.ReactNode;
  className?: string;
  lineClamp?: number;
}

const Paragraph: React.FC<ParagraphProps> = ({ children, className, lineClamp = 5 }) => {
  const paraRef = useRef<HTMLSpanElement>(null);
  const [showBtn, setShowBtn] = useState(false);
  const { isShowModal, handleCloseModal, handleShowModal } = useControlModal();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === paraRef.current) {
          const para = entry.target as HTMLElement;
          const lineHeight = parseInt(window.getComputedStyle(para).lineHeight || '0');
          const heightPara = para.scrollHeight;
          const countLines = lineHeight > 0 ? Math.floor(heightPara / lineHeight) : 0;

          if (countLines > lineClamp) {
            setShowBtn(true);
            return;
          }

          setShowBtn(false);
        }
      }
    });
    if (paraRef.current) {
      observer.observe(paraRef.current);
    }

    return () => {
      if (paraRef.current) {
        observer.unobserve(paraRef.current);
      }
    };
  }, [lineClamp]);

  const handleSeeMore = () => {
    handleShowModal();
  };

  const hasTextColor = typeof className === 'string' && className.includes('text-');
  const paragraphStyles = cn(
    'leading-[1.3] whitespace-normal',
    className,
    !hasTextColor && 'text-primary'
  );

  return (
    <>
      <span
        style={
          {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: `${lineClamp}`,
          } as React.CSSProperties
        }
        ref={paraRef}
        className={paragraphStyles}
      >
        {children}
      </span>
      {showBtn && (
        <div>
          <Button
            aria-label="more-btn"
            aria-expanded={isShowModal}
            onClick={handleSeeMore}
            className="text-[14px] !font-medium text-primary"
          >
            Xem thêm
          </Button>
          <ContentModal
            content={typeof children === 'string' ? children : ''}
            isShowModal={isShowModal}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </>
  );
};

export default Paragraph;
