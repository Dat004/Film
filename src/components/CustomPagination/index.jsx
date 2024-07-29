import { GrFormNext, GrFormPrevious } from "react-icons/gr";

import { FlexContainer, FlexItems } from "../Flex";
import PreviousPage from "./PreviousPage";
import NextPage from "./NextPage";
import Button from "../Button";

function CustomPagination({
  startIndex = 0,
  endIndex = 0,
  activeIndex = 0,
  countsNext = 2,
  countsPrev = 2,
  onIndex = () => {},
  onNextIndex = () => {},
  onPrevIndex = () => {},
}) {
  const handleChangeIndex = (e) => {
    const index = +e.target.dataset.index;

    onIndex(index);
  };

  return (
    <FlexContainer className="mt-[40px] gap-x-[6px] justify-center">
      <FlexItems>
        <Button
          onClick={onPrevIndex}
          disabled={activeIndex <= startIndex}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px]">
            <GrFormPrevious />
          </i>
        </Button>
      </FlexItems>
      {activeIndex !== startIndex && (
        <FlexItems>
          <Button
            onClick={handleChangeIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            data-index={startIndex}
            outline
          >
            {startIndex}
          </Button>
        </FlexItems>
      )}
      {activeIndex > startIndex + countsPrev + 1 && (
        <FlexItems>
          <p className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] justify-center text-primary select-none">
            <span>&hellip;</span>
          </p>
        </FlexItems>
      )}
      <PreviousPage
        activeIndex={activeIndex}
        countsPrev={countsPrev}
        startIndex={startIndex}
        onClick={handleChangeIndex}
      />
      <FlexItems>
        <Button
          onClick={handleChangeIndex}
          data-index={activeIndex}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-active-pagination hover:!text-primary text-[14px] bg-bg-btn-active-pagination p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          {activeIndex}
        </Button>
      </FlexItems>
      <NextPage
        activeIndex={activeIndex}
        countsNext={countsNext}
        endIndex={endIndex}
        onClick={handleChangeIndex}
      />
      {activeIndex < endIndex - countsNext - 1 && (
        <FlexItems>
          <p className="text-center leading-[1.65] p-[4px] min-w-[35px] h-[35px] justify-center text-primary select-none">
            <span>&hellip;</span>
          </p>
        </FlexItems>
      )}
      {activeIndex !== endIndex && (
        <FlexItems>
          <Button
            onClick={handleChangeIndex}
            data-index={endIndex}
            className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
            outline
          >
            {endIndex}
          </Button>
        </FlexItems>
      )}
      <FlexItems>
        <Button
          onClick={onNextIndex}
          disabled={activeIndex >= endIndex}
          className="border-bd-btn-pagination-color hover:bg-bg-bt,pn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
        >
          <i className="text-[18px]">
            <GrFormNext />
          </i>
        </Button>
      </FlexItems>
    </FlexContainer>
  );
}

export default CustomPagination;
