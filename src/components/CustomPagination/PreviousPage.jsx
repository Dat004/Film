import { useState, useEffect } from "react";

import Button from "../Button";

function PreviousPage({
  activeIndex = 0,
  countsPrev = 0,
  startIndex = 0,
  ...props
}) {
  const [arrCountsPrev, setArrCountsPrev] = useState([]);

  useEffect(() => {
    let startPrevIndex = activeIndex - countsPrev;
    let totalCountsPrevArray = [];

    for (let i = startPrevIndex; i < activeIndex; i++) {
      totalCountsPrevArray.push(i);
    }

    setArrCountsPrev(
      [...totalCountsPrevArray]?.filter((items) => +items > startIndex)
    );
  }, [activeIndex, countsPrev, startIndex]);
  return (
    <>
      {arrCountsPrev?.map((items, index) => (
        <Button
          key={index}
          data-index={items}
          className="border-bd-btn-pagination-color hover:bg-bg-btn-hover-pagination hover:!text-primary text-[14px] p-[4px] min-w-[35px] h-[35px]"
          outline
          {...props}
        >
          {items}
        </Button>
      ))}
    </>
  );
}

export default PreviousPage;
