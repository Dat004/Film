import { useRef, useEffect, useState } from "react";
import classNames from "classnames";

import ContentModal from "../Modal/ContentModal";
import { useControlModal } from "../../hooks";
import Button from "../Button";

function Paragraph({ children, className, lineClamp = 5 }) {
  const paraRef = useRef();
  const [showBtn, setShowBtn] = useState(false);
  const { isShowModal, handleCloseModal, handleShowModal } = useControlModal();

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === paraRef.current) {
          const para = entry.target;
          const lineHeight = parseInt(window.getComputedStyle(para).lineHeight);
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

  const paragraphStyles = classNames(
    "leading-[1.3] text-primary whitespace-normal ",
    {
      [className]: className,
    }
  );

  return (
    <>
      <span
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: `${lineClamp}`,
        }}
        ref={paraRef}
        className={paragraphStyles}
      >
        {children}
      </span>
      {showBtn && (
        <div>
          <Button
            onClick={handleSeeMore}
            className="text-[14px] !font-medium text-primary"
          >
            Xem thêm
          </Button>
          <ContentModal
            content={children}
            isShowModal={isShowModal}
            onClose={handleCloseModal}
          ></ContentModal>
        </div>
      )}
    </>
  );
}

export default Paragraph;
