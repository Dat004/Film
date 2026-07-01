import * as React from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Button from "./button";

interface PaginationProps {
  startIndex?: number;
  endIndex?: number;
  activeIndex?: number;
  countsNext?: number;
  countsPrev?: number;
  onIndex?: (index: number) => void;
  onNextIndex?: () => void;
  onPrevIndex?: () => void;
}

export function Pagination({
  startIndex = 1,
  endIndex = 1,
  activeIndex = 1,
  countsNext = 2,
  countsPrev = 2,
  onIndex = () => {},
  onNextIndex = () => {},
  onPrevIndex = () => {},
}: PaginationProps) {
  const [isMediumMobile, setIsMediumMobile] = React.useState(false);
  const [isSmallMobile, setIsSmallMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMediumMobile(window.matchMedia("only screen and (max-width: 710px)").matches);
      setIsSmallMobile(window.matchMedia("only screen and (max-width: 480px)").matches);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const countPrevInMobile = isSmallMobile ? 0 : isMediumMobile ? 1 : countsPrev;
  const countNextInMobile = isSmallMobile ? 0 : isMediumMobile ? 1 : countsNext;

  const handleChangeIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = +(e.currentTarget.dataset.index || 0);
    onIndex(index);
  };

  const prevPages = React.useMemo(() => {
    const startPrevIndex = activeIndex - countPrevInMobile;
    const list = [];
    for (let i = startPrevIndex; i < activeIndex; i++) {
      if (i > startIndex) {
        list.push(i);
      }
    }
    return list;
  }, [activeIndex, countPrevInMobile, startIndex]);

  const nextPages = React.useMemo(() => {
    const startNextIndex = activeIndex + 1;
    const totalCountsStart = activeIndex + countNextInMobile;
    const list = [];
    for (let i = startNextIndex; i <= totalCountsStart; i++) {
      if (i < endIndex) {
        list.push(i);
      }
    }
    return list;
  }, [activeIndex, countNextInMobile, endIndex]);

  return (
    <div className="flex mt-[40px] gap-x-[6px] justify-center items-center">
      <div>
        <Button
          onClick={onPrevIndex}
          disabled={activeIndex <= startIndex}
          aria-label="prev-btn"
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px] flex items-center justify-center">
            <GrFormPrevious />
          </i>
        </Button>
      </div>
      
      {activeIndex !== startIndex && (
        <div>
          <Button
            onClick={handleChangeIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            aria-label={String(startIndex)}
            data-index={startIndex}
            outline
          >
            {startIndex}
          </Button>
        </div>
      )}
      
      {activeIndex > startIndex + countPrevInMobile + 1 && (
        <div>
          <p className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] flex items-center justify-center text-primary select-none">
            <span>&hellip;</span>
          </p>
        </div>
      )}

      {prevPages.map((items) => (
        <Button
          key={`prev-${items}`}
          onClick={handleChangeIndex}
          data-index={items}
          aria-label={String(items)}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          {items}
        </Button>
      ))}

      <div>
        <Button
          onClick={handleChangeIndex}
          aria-label={String(activeIndex)}
          data-index={activeIndex}
          className="pagination-page-active border-bd-btn-pagination-color hover:bg-bg-btn-hover-active-pagination hover:!text-primary text-[14px] bg-bg-btn-active-pagination p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          {activeIndex}
        </Button>
      </div>

      {nextPages.map((items) => (
        <Button
          key={`next-${items}`}
          onClick={handleChangeIndex}
          data-index={items}
          aria-label={String(items)}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          {items}
        </Button>
      ))}

      {activeIndex < endIndex - countNextInMobile - 1 && (
        <div>
          <p className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] flex items-center justify-center text-primary select-none">
            <span>&hellip;</span>
          </p>
        </div>
      )}

      {activeIndex !== endIndex && (
        <div>
          <Button
            onClick={handleChangeIndex}
            aria-label={String(endIndex)}
            data-index={endIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            outline
          >
            {endIndex}
          </Button>
        </div>
      )}

      <div>
        <Button
          onClick={onNextIndex}
          aria-label="next-btn"
          disabled={activeIndex >= endIndex}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px] flex items-center justify-center">
            <GrFormNext />
          </i>
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
