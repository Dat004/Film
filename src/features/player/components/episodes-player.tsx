"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CgMenuLeft } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

import { useDebounce } from "@/hooks/use-debounce";
import { PlayIconCustom } from "@/icons";
import WatchListButton from "@/components/film/WatchListButton";
import Button from "@/components/ui/button";
import { usePlayerStore } from "../stores/player-store";

// ==========================================
// 1. SelectMenuPartMovie Component
// ==========================================
interface SelectMenuPartMovieProps {
  dataMenuSelect?: any[][];
  currentPartMovie?: number;
  isShowMenu?: boolean;
  handleSelect?: (index: number) => void;
}

function SelectMenuPartMovie({
  dataMenuSelect = [],
  currentPartMovie = 0,
  isShowMenu = false,
  handleSelect = () => {},
}: SelectMenuPartMovieProps) {
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

  const handleSelectIndex = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = e.currentTarget.getAttribute("data-index");
    if (index !== null) {
      handleSelect(+index);
    }
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
          className="absolute origin-top-right left-0 top-[calc(100%+25%)] w-full z-[50]"
        >
          <div className="w-full max-h-[150px] rounded-l-[8px] py-[5px] bg-bg-layout overflow-auto shadow-lg border border-bd-filed-form-color">
            {dataMenuSelect.map((items: any, index: number) => (
              <Button
                className={`w-full h-full !justify-start hover:!text-primary ${
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
                items[items.length - 1]?.slug?.split("-")[1] ? (
                  <>
                    <span className="ml-[4px]">
                      {items[0]?.slug?.split("-")[1]}
                    </span>
                    <span>-</span>
                    <span>{items[items.length - 1]?.slug?.split("-")[1]}</span>
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

// ==========================================
// 2. EpisodeItem Component
// ==========================================
interface EpisodeItemProps {
  data?: Record<string, any>;
  isHadFound?: boolean;
  currentEpisode?: boolean;
  isOdd?: boolean;
  isEven?: boolean;
  onClick?: () => void;
}

function EpisodeItem({
  data = {},
  isHadFound = false,
  currentEpisode = false,
  isOdd = false,
  isEven = false,
  onClick,
  ...props
}: EpisodeItemProps) {
  const episodeRef = React.useRef<HTMLDivElement | null>(null);

  const episodeStyles = cn(
    "relative border-l-[4px] border-solid cursor-pointer transition-colors duration-150",
    {
      "border-bd-active bg-bg-select-color text-primary": currentEpisode,
      "border-transparent text-title hover:bg-bg-select-color hover:text-primary": !currentEpisode,
      "bg-transparent": isEven && !currentEpisode,
      "bg-bg-odd-color": isOdd && !currentEpisode,
    }
  );

  const flickerClasses = cn({
    "flicker-frame": isHadFound,
    "": !isHadFound,
  });

  React.useEffect(() => {
    if (isHadFound || currentEpisode) {
      episodeRef.current?.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  }, [isHadFound, currentEpisode]);

  return (
    <div ref={episodeRef} className={episodeStyles} onClick={onClick} {...props}>
      <div className={flickerClasses}></div>
      <div className="flex items-center px-[15px] py-[7px]">
        <div className="flex-grow-0 flex-shrink-0 mr-[24px]">
          <span className="text-[12px] font-semibold">{data.name}</span>
        </div>
        <div className="w-0 flex-grow flex-shrink">
          <p className="text-[12px] font-normal truncate">
            <span>{data.filename}</span>
          </p>
        </div>
        {currentEpisode && (
          <div className="flex-grow-0 flex-shrink-0 ml-[24px]">
            <PlayIconCustom
              data-episode={data.name}
              widthContainer="24px"
              heightContainer="24px"
              className="text-[10px] pl-[2px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. Header Component
// ==========================================
interface HeaderProps {
  dataPartMovies?: any[][];
  searchEpisodeValue?: string;
  handleSelect?: (currentIndex: number) => void;
  handleSearchEpisodeValue?: (episode: string) => void;
}

function Header({
  dataPartMovies = [],
  searchEpisodeValue = "",
  handleSelect = () => {},
  handleSearchEpisodeValue = () => {},
}: HeaderProps) {
  const [isShowMenu, setIsShowMenu] = React.useState(false);
  const [episodeNumber, setEpisodeNumber] = React.useState({
    start: "",
    end: "",
    full: "",
  });

  const currentIndexSplitEpisodes = usePlayerStore(
    (state) => state.episode.currentIndexSplitEpisodes
  );

  React.useEffect(() => {
    const handleClickOutsideMenu = () => {
      if (isShowMenu) setIsShowMenu(false);
    };
    window.addEventListener("click", handleClickOutsideMenu);
    return () => window.removeEventListener("click", handleClickOutsideMenu);
  }, [isShowMenu]);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShowMenu((state) => !state);
  };

  const handleChangeSearchEpisodeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchEpisodeValue(e.target.value);
  };

  React.useEffect(() => {
    let start = "";
    let end = "";
    let full = "";

    dataPartMovies.forEach((items: any, index: number) => {
      if (currentIndexSplitEpisodes === index) {
        const episodeStart = items[0]?.slug?.split("-")[1];
        const episodeEnd = items[items.length - 1]?.slug?.split("-")[1];

        if (!episodeStart || !episodeEnd) {
          full = items[0]?.slug || "";
          return;
        }

        start = episodeStart;
        end = episodeEnd;
      }
    });

    setEpisodeNumber({ start, end, full });
  }, [currentIndexSplitEpisodes, dataPartMovies]);

  return (
    <div className="py-[12px] bg-[var(--bg-episodes-header)]">
      <div className="flex items-center px-[15px] mb-[8px] justify-between">
        <div className="flex-shrink">
          <p className="text-[12px] text-primary font-medium">
            List of episodes:
          </p>
        </div>
        <div className="relative flex-shrink hidden ssm:block">
          <WatchListButton right top />
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative flex-grow w-[50%] px-[15px] flex-shrink-0">
          <div className="flex items-center gap-x-[16px]">
            <div>
              <Button
                aria-label="menu-btn"
                aria-haspopup="menu"
                onClick={handleToggleMenu}
                className="px-[8px] py-[6px]"
              >
                <CgMenuLeft className="text-[18px]" />
              </Button>
            </div>
            <div>
              <p className="text-primary text-[12px]">
                {(episodeNumber.start || episodeNumber.end) &&
                !episodeNumber.full ? (
                  <>
                    <span>{episodeNumber.start}</span>
                    <span>-</span>
                    <span>{episodeNumber.end}</span>
                  </>
                ) : (
                  <span className="capitalize">{episodeNumber.full}</span>
                )}
              </p>
            </div>
          </div>
          <SelectMenuPartMovie
            isShowMenu={isShowMenu}
            currentPartMovie={currentIndexSplitEpisodes}
            dataMenuSelect={dataPartMovies}
            handleSelect={handleSelect}
          />
        </div>
        <div className="flex-grow w-[50%] px-[15px] flex-shrink-0">
          <div className="text-primary ml-auto w-full min-w-[100px] max-w-[250px] border border-solid border-bd-filed-form-color p-[4px] rounded-[4px] flex items-center bg-bg-input">
            <div className="px-[3px]">
              <IoSearch className="text-[14px]" />
            </div>
            <div className="text-[12px] flex-grow px-[4px] text-primary font-normal">
              <input
                className="w-full bg-transparent outline-none border-none text-[12px]"
                type="text"
                placeholder="Find episode"
                value={searchEpisodeValue}
                onChange={handleChangeSearchEpisodeValue}
                name="episode"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. Main EpisodesPlayer Component
// ==========================================
interface EpisodesPlayerProps {
  dataEpisodes?: any[];
}

export function EpisodesPlayer({ dataEpisodes = [] }: EpisodesPlayerProps) {
  const [searchEpisodeValue, setSearchEpisodeValue] = React.useState("");

  const splitEpisodes = usePlayerStore((state) => state.episode.splitEpisodes);
  const currentIndexSplitEpisodes = usePlayerStore((state) => state.episode.currentIndexSplitEpisodes);
  const currentEpisode = usePlayerStore((state) => state.episode.currentEpisode);

  const setSplitEpisodes = usePlayerStore((state) => state.setSplitEpisodes);
  const setCurrentIndexSplitEpisodes = usePlayerStore((state) => state.setCurrentIndexSplitEpisodes);
  const setCurrentEpisode = usePlayerStore((state) => state.setCurrentEpisode);

  const searchEpisodeValueDebounce = useDebounce(searchEpisodeValue, 1000);

  // Split episodes chunks
  React.useEffect(() => {
    const total_episode = dataEpisodes?.length || 0;
    if (total_episode === 0) return;

    let countsItem = 0;
    let chunkArrayEpisodes: any[][] = [];
    let itemRemainings = 0;

    if (total_episode > 0 && total_episode <= 35) countsItem = total_episode;
    else if (total_episode > 35 && total_episode < 100) countsItem = 20;
    else if (total_episode > 100 && total_episode <= 160) countsItem = 30;
    else if (total_episode > 160 && total_episode <= 240) countsItem = 40;
    else if (total_episode > 240 && total_episode <= 300) countsItem = 50;
    else if (total_episode > 300 && total_episode <= 420) countsItem = 60;
    else if (total_episode > 420 && total_episode <= 550) countsItem = 70;
    else if (total_episode > 550 && total_episode <= 720) countsItem = 80;
    else if (total_episode > 720 && total_episode <= 900) countsItem = 90;
    else countsItem = 120;

    if (countsItem === 0) return;

    for (let i = countsItem; i < total_episode; i += countsItem) {
      chunkArrayEpisodes.push(dataEpisodes.slice(i - countsItem, i));
      itemRemainings = i;
    }

    if (itemRemainings < total_episode) {
      chunkArrayEpisodes.push(dataEpisodes.slice(itemRemainings));
    }

    setSplitEpisodes(chunkArrayEpisodes);
  }, [dataEpisodes, setSplitEpisodes]);

  // Search episode search trigger
  React.useEffect(() => {
    if (searchEpisodeValueDebounce) {
      const parsedSearch = +searchEpisodeValueDebounce;
      const getIndexPartMovie = splitEpisodes?.findIndex((items) =>
        items?.some((value: any) => {
          const episodeNum = +value?.slug?.split("-")[1];
          return !isNaN(episodeNum) && episodeNum === parsedSearch;
        })
      );

      if (getIndexPartMovie === -1 || getIndexPartMovie === undefined) {
        setCurrentIndexSplitEpisodes(0);
        return;
      }

      setCurrentIndexSplitEpisodes(getIndexPartMovie);
    }
  }, [searchEpisodeValueDebounce, splitEpisodes, setCurrentIndexSplitEpisodes]);

  // Current episode update chunk index sync
  React.useEffect(() => {
    if (!dataEpisodes || dataEpisodes.length === 0 || !splitEpisodes || splitEpisodes.length === 0) return;

    const currentSlug = dataEpisodes[currentEpisode]?.slug;
    if (!currentSlug) return;
    const currentEpisodeNum = currentSlug.split("-")[1];

    const searchEpisode = splitEpisodes.findIndex((item) =>
      item.some((value: any) => value?.slug?.split("-")[1] === currentEpisodeNum)
    );

    if (searchEpisode === -1) {
      setCurrentIndexSplitEpisodes(0);
      return;
    }

    setCurrentIndexSplitEpisodes(searchEpisode);
  }, [splitEpisodes, currentEpisode, dataEpisodes, setCurrentIndexSplitEpisodes]);

  const handleChangeCurrentPartMovie = React.useCallback(
    (currentIndex: number) => {
      setCurrentIndexSplitEpisodes(currentIndex);
    },
    [setCurrentIndexSplitEpisodes]
  );

  const handleSearchEpisode = React.useCallback((episode: string) => {
    setSearchEpisodeValue(episode);
  }, []);

  const handleGetEpisode = (slug: string) => {
    const findEpisode = dataEpisodes.findIndex((items) =>
      items?.slug?.includes(slug)
    );
    if (findEpisode !== -1) {
      setCurrentEpisode(findEpisode);
    }
  };

  return (
    <div className="absolute w-[300px] slm:w-full slm:relative left-0 top-0 h-full bg-bg-player border-r border-bd-filed-form-color/10">
      <div className="w-full h-full flex flex-col">
        <Header
          dataPartMovies={splitEpisodes}
          searchEpisodeValue={searchEpisodeValue}
          handleSelect={handleChangeCurrentPartMovie}
          handleSearchEpisodeValue={handleSearchEpisode}
        />
        <div className="w-full flex-1 max-h-[calc(100%-78px)] slm:max-h-[350px] mdm:max-h-[225px] overflow-auto">
          {splitEpisodes[currentIndexSplitEpisodes]?.map((items: any, index: number) => {
            const isHadFound =
              +items?.slug?.split("-")[1] === +searchEpisodeValueDebounce;

            return (
              <EpisodeItem
                data={items}
                isHadFound={isHadFound}
                currentEpisode={
                  items?.slug === dataEpisodes[currentEpisode]?.slug
                }
                isEven={index % 2 === 0}
                isOdd={index % 2 !== 0}
                onClick={() => handleGetEpisode(items?.slug)}
                key={index}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EpisodesPlayer;

