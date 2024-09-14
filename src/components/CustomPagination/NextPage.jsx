import { useState, useEffect } from "react";

import Button from "../Button";

function NextPage({ activeIndex = 0, countsNext = 0, endIndex = 0, ...props }) {
  const [arrCountsNext, setArrCountsNext] = useState([]);

  useEffect(() => {
    let totalCountsStart = activeIndex + countsNext;
    let startNextIndex = activeIndex + 1;
    let totalCountsNextArray = [];

    for (let i = startNextIndex; i <= totalCountsStart; i++) {
      totalCountsNextArray.push(i);
    }

    setArrCountsNext(
      [...totalCountsNextArray]?.filter((items) => +items < endIndex)
    );
  }, [activeIndex, countsNext, endIndex]);

  return (
    <>
      {arrCountsNext?.map((items, index) => (
        <Button
          key={index}
          data-index={items}
          aria-label={items}
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

export default NextPage;
