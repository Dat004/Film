import { useRef, useEffect } from "react";
import classNames from "classnames";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import { PlayIconCustom } from "../../../../icons";

function EpisodeItem({
  data = {},
  isHadFound = false,
  currentEpisode = false,
  isOdd = false,
  isEven = false,
  ...props
}) {
  const episodeRef = useRef();

  const episodeStyles = classNames(
    "border-l-[4px] border-solid cursor-pointer",
    {
      "border-bd-active bg-bg-select-color text-primary": currentEpisode,
      "border-transparent text-title hover:bg-bg-select-color hover:text-primary":
        !currentEpisode,
      "bg-transparent": isEven && !currentEpisode,
      "bg-bg-odd-color": isOdd && !currentEpisode,
    }
  );

  useEffect(() => {
    if (isHadFound) {
      episodeRef?.current?.scrollIntoView({
        block: 'end',
        behavior: "smooth",
      });
    }
  }, [isHadFound]);

  return (
    <div ref={episodeRef} className={episodeStyles} {...props}>
      <FlexContainer className="items-center px-[15px] py-[7px]">
        <FlexItems className="flex-grow-0 flex-shrink-0 mr-[24px]">
          <span className="text-[12px] font-semibold">{data?.name}</span>
        </FlexItems>
        <FlexItems className="w-[0] flex-grow flex-shrink">
          <p className="text-[12px] font-normal">
            <span>{data?.filename}</span>
          </p>
        </FlexItems>
        {currentEpisode && (
          <FlexItems className="flex-grow-0 flex-shrink-0 ml-[24px]">
            <PlayIconCustom
              widthContainer="24px"
              heightContainer="24px"
              className="text-[10px] pl-[2px]"
            />
          </FlexItems>
        )}
      </FlexContainer>
    </div>
  );
}

export default EpisodeItem;
