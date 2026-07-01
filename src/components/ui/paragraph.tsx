"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import ContentModal from "@/components/ui/content-modal";
import Button from "@/components/ui/button";

interface ParagraphProps {
  children?: React.ReactNode;
  className?: string;
  lineClamp?: number;
}

export function Paragraph({ children, className = "", lineClamp = 5 }: ParagraphProps) {
  const paraRef = React.useRef<HTMLSpanElement | null>(null);
  const [showBtn, setShowBtn] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!paraRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === paraRef.current) {
          const para = entry.target as HTMLElement;
          const style = window.getComputedStyle(para);
          const lineHeight = parseInt(style.lineHeight) || 20;
          const heightPara = para.scrollHeight;
          const countLines = Math.floor(heightPara / lineHeight);

          if (countLines > lineClamp) {
            setShowBtn(true);
            return;
          }
          setShowBtn(false);
        }
      }
    });

    observer.observe(paraRef.current);
    return () => {
      observer.disconnect();
    };
  }, [lineClamp]);

  const hasTextColor = className.includes("text-");
  const paragraphStyles = cn(
    "leading-[1.3] whitespace-normal",
    className,
    !hasTextColor && "text-primary"
  );

  return (
    <>
      <span
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: lineClamp,
        }}
        ref={paraRef}
        className={paragraphStyles}
      >
        {children}
      </span>
      {showBtn && (
        <div className="mt-1">
          <Button
            aria-label="more-btn"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(true)}
            className="text-[14px] !font-medium text-primary px-0 hover:bg-transparent hover:underline"
          >
            Xem thêm
          </Button>
          <ContentModal
            content={children}
            isShowModal={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}

export default Paragraph;
