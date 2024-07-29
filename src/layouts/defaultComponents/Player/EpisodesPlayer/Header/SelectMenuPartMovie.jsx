import { AnimatePresence, motion } from "framer-motion";

import Button from "../../../../../components/Button";

function SelectMenuPartMovie({
  dataMenuSelect = [],
  currentPartMovie = 0,
  isShowMenu = false,
  handleSelect = () => {},
}) {
  const variants = {
    hide: {
      scaleY: 0,
      height: 0,
      opacity: 0,
    },
    show: {
      scaleY: 1,
      height: "auto",
      opacity: 1,
    },
  };

  const handleSelectIndex = (e) => {
    const index = e.target.dataset.index;

    handleSelect(+index);
  };

  return (
    <AnimatePresence>
      {isShowMenu && (
        <motion.div
          layout
          initial="hide"
          animate="show"
          exit="hide"
          variants={variants}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="absolute origin-top-right left-0 top-[calc(100%+25%)] w-[100%] z-[50]"
        >
          <div className="w-[100%] max-h-[150px] rounded-l-[8px] py-[5px] bg-bg-layout overflow-auto">
            {dataMenuSelect?.map((items, index) => (
              <Button
                className={`w-[100%] h-[100%] !justify-start hover:!text-primary ${
                  index !== currentPartMovie
                    ? "text-title hover:bg-bg-odd-color"
                    : "text-primary bg-bg-select-color"
                } p-[8px] text-[12px] font-medium`}
                data-index={index}
                onClick={handleSelectIndex}
                key={index}
              >
                <span>EPS:</span>
                {items[0]?.slug?.split("-")[1] ||
                items[items?.length - 1]?.slug?.split("-")[1] ? (
                  <>
                    <span className="ml-[4px]">
                      {items[0]?.slug?.split("-")[1]}
                    </span>
                    <span>-</span>
                    <span>{items[items?.length - 1]?.slug?.split("-")[1]}</span>
                  </>
                ) : (
                  <span className="ml-[4px] capitalize">{items[0]?.slug}</span>
                )}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SelectMenuPartMovie;
