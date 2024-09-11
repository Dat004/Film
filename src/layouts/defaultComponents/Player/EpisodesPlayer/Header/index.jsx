import { useEffect, useState } from "react";
import { CgMenuLeft } from "react-icons/cg";
import { IoSearch } from "react-icons/io5";

import WatchListButton from "../../../../../components/Button/WatchListButton";
import { FlexContainer, FlexItems } from "../../../../../components/Flex";
import SelectMenuPartMovie from "./SelectMenuPartMovie";
import Button from "../../../../../components/Button";

function Header({
  dataPartMovies = [],
  searchEpisodeValue = "",
  currentPartMovie = 0,
  handleSelect = () => {},
  handleSearchEpisodeValue = () => {},
}) {
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [episodeNumber, setEpisodeNumber] = useState({
    start: "",
    end: "",
    full: "",
  });

  useEffect(() => {
    window.addEventListener("click", handleClickOutsideMenu);

    return () => window.removeEventListener("click", handleClickOutsideMenu);
  }, [isShowMenu]);

  const handleClickOutsideMenu = () => {
    if (isShowMenu) setIsShowMenu(false);
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();

    setIsShowMenu((state) => !state);
  };

  const handleChangeSearchEpisodeValue = (e) => {
    const value = e.target.value;

    handleSearchEpisodeValue(value);
  };

  useEffect(() => {
    let start = "";
    let end = "";
    let full = "";

    dataPartMovies?.map((items, index) => {
      if (currentPartMovie === index) {
        const episodeStart = items[0]?.slug?.split("-")[1];
        const episodeEnd = items[items?.length - 1]?.slug?.split("-")[1];

        if (!episodeStart || !episodeEnd) {
          full = items[0]?.slug;

          return;
        }

        start = episodeStart;
        end = episodeEnd;
      }
    });

    setEpisodeNumber((state) => ({
      ...state,
      start: start,
      end: end,
      full: full,
    }));
  }, [currentPartMovie, dataPartMovies]);

  return (
    <div className="py-[12px] bg-[rgb(20,21,26)]">
      <FlexContainer className="items-center px-[15px] mb-[8px] justify-between">
        <FlexItems className="!flex-shrink">
          <p className="text-[12px] text-primary font-medium">
            List of episodes:
          </p>
        </FlexItems>
        <FlexItems className="relative !flex-shrink hidden ssm:block">
          <WatchListButton right top />
        </FlexItems>
      </FlexContainer>
      <FlexContainer className="items-center">
        <FlexItems className="relative flex-grow w-[50%] px-[15px] flex-shrink-0">
          <FlexContainer className="gap-x-[16px]">
            <FlexItems>
              <Button onClick={handleToggleMenu}>
                <CgMenuLeft className="text-[18px]" />
              </Button>
            </FlexItems>
            <FlexItems>
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
            </FlexItems>
          </FlexContainer>
          <SelectMenuPartMovie
            isShowMenu={isShowMenu}
            currentPartMovie={currentPartMovie}
            dataMenuSelect={dataPartMovies}
            handleSelect={handleSelect}
          />
        </FlexItems>
        <FlexItems className="flex-grow w-[50%] px-[15px] flex-shrink-0">
          <FlexContainer className="text-primary ml-auto w-[100%] min-w-[100px] max-w-[250px] border border-solid border-bd-filed-form-color p-[4px] rounded-[4px] items-center">
            <FlexItems className="px-[3px]">
              <IoSearch className="text-[14px]" />
            </FlexItems>
            <FlexItems className="text-[12px] !flex-grow-0 !flex-shrink px-[4px] text-primary font-normal">
              <input
                className="w-[100%]"
                type="text"
                placeholder="Find episode"
                value={searchEpisodeValue}
                onChange={handleChangeSearchEpisodeValue}
                name="episode"
              />
            </FlexItems>
          </FlexContainer>
        </FlexItems>
      </FlexContainer>
    </div>
  );
}

export default Header;
