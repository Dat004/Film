import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useDebounce } from "../../../../hooks";
import { videoPlayerSelector } from "../../../../redux/selectors";
import {
    setCurrentEpisode,
    setCurrentIndexSplitEpisodes,
    setSplitEpisodes,
    setStatusMovie,
} from "../../../../redux/slices/videoPlayerSlice";
import EpisodeItem from "./EpisodeItem";
import Header from "./Header";

function EpisodesPlayer({ dataEpisodes = [] }) {
  const [searchEpisodeValue, setSearchEpisodeValue] = useState("");
  const dispatch = useDispatch();
  const videoPlayerState = useSelector(videoPlayerSelector);

  const { episode, statusMovie } = videoPlayerState;
  const { isPlay, autoPlay } = statusMovie;
  const { splitEpisodes, currentIndexSplitEpisodes, currentEpisode } = episode;

  const searchEpisodeValueDebounce = useDebounce(searchEpisodeValue, 1000);

  useEffect(() => {
    const total_episode = dataEpisodes?.length;

    let countsItem = 0;
    let chunkArrayEpisodes = [];
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

    for (let i = countsItem; i < total_episode; i += countsItem) {
      chunkArrayEpisodes.push(dataEpisodes?.slice(i - countsItem, i));
      itemRemainings = i;
    }

    if (itemRemainings < total_episode) {
      chunkArrayEpisodes.push(dataEpisodes?.slice(itemRemainings));
    }

    dispatch(setSplitEpisodes(chunkArrayEpisodes));
  }, [dataEpisodes]);

  useEffect(() => {
    if (searchEpisodeValueDebounce) {
      const getIndexPartMovie = splitEpisodes?.findIndex((items) =>
        items?.some(
          (value) =>
            +value?.slug?.split("-")[1]?.includes(+searchEpisodeValueDebounce)
        )
      );

      if (getIndexPartMovie === -1) {
        dispatch(setCurrentIndexSplitEpisodes(0));

        return;
      }

      dispatch(setCurrentIndexSplitEpisodes(getIndexPartMovie));

      return;
    }
  }, [searchEpisodeValueDebounce, splitEpisodes]);

  const handleChangeCurrentPartMovie = useCallback(
    (currentIndex) => {
      dispatch(setCurrentIndexSplitEpisodes(currentIndex));
    },
    [currentIndexSplitEpisodes]
  );

  const handleSearchEpisode = useCallback((episode) => {
    setSearchEpisodeValue(episode);
  }, []);

  const handleGetEpisode = (slug) => {
    const findEpisode = dataEpisodes?.findIndex((items) =>
      items?.slug?.includes(slug)
    );

    dispatch(setCurrentEpisode(findEpisode));
  };

  return (
    <div className="absolute w-[300px] slm:w-[100%] slm:relative left-0 top-0 h-full bg-bg-player">
      <div className="w-[100%] h-full">
        <Header
          dataPartMovies={splitEpisodes}
          currentPartMovie={currentIndexSplitEpisodes}
          searchEpisodeValue={searchEpisodeValue}
          handleSelect={handleChangeCurrentPartMovie}
          handleSearchEpisodeValue={handleSearchEpisode}
        />
        <div className="w-[100%] max-h-[calc(100%-78px)] slm:max-h-[350px] mdm:max-h-[225px] overflow-auto">
          <>
            {splitEpisodes[currentIndexSplitEpisodes]?.map((items, index) => {
              let i = index;
              const isHadFound =
                +items?.slug?.split("-")[1] === +searchEpisodeValueDebounce;

              return (
                <EpisodeItem
                  data={items}
                  isHadFound={isHadFound}
                  currentEpisode={
                    items?.slug === dataEpisodes[currentEpisode]?.slug
                  }
                  isEven={i % 2 === 0}
                  isOdd={i % 2 !== 0}
                  onClick={() => handleGetEpisode(items?.slug)}
                  key={index}
                />
              );
            })}
          </>
        </div>
      </div>
    </div>
  );
}

export default EpisodesPlayer;
