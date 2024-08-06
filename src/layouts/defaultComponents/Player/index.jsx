import { useSelector } from "react-redux";

import { FlexContainer, FlexItems } from "../../../components/Flex";
import { videoPlayerSelector } from "../../../redux/selectors";
import DetailFilm from "./DetailFilmPlayer";
import EpisodesPlayer from "./EpisodesPlayer";
import VideoPlayer from "./VideoPlayer";

function Player({ data = {} }) {
  const videoPlayerState = useSelector(videoPlayerSelector);

  const { currentEpisode } = videoPlayerState.episode;
  const { episodes, movie } = data;
  const { thumb_url, name } = movie;

  const dataEpisodes = episodes
    ?.map((items) => items?.server_data)
    ?.find((value) => value);

  return (
    <div className="relative px-[15px] clm:px-0">
      <div className="mx-auto 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              backgroundImage: `url(${thumb_url})`,
              filter: "blur(20px)",
            }}
            className="w-[100%] h-full bg-no-repeat bg-cover bg-center opacity-60"
          ></div>
        </div>
        <div className="relative pt-[20px] pb-[50px] slm:pt-0 2xlm:pb-[20px] slm:pb-[10px]">
          <div className="slm:hidden mb-[16px]">
            <p className="text-[12px] font-normal text-primary">
              <span>Bạn đang xem</span>
              <span className="mx-[5px]">&bull;</span>
              <span className="">{name}</span>
              <span className="mx-[5px]">&bull;</span>
              <span>{dataEpisodes[currentEpisode].name}</span>
            </p>
          </div>
          <FlexContainer className="relative !gap-y-0 2xlm:flex-col">
            <FlexItems className="relative w-[75%] h-fit 2xlm:w-[auto]">
              <VideoPlayer dataEpisodes={dataEpisodes} thumbUrl={thumb_url} />
              <EpisodesPlayer dataEpisodes={dataEpisodes} />
            </FlexItems>
            <FlexItems className="w-[25%] pl-[30px] 2xlm:pl-0 2xlm:relative 2xlm:py-[35px] clm:py-[25px] 2xlm:w-[100%] clm:px-[15px] flex-shrink-0 ">
              <DetailFilm dataMovie={movie} />
            </FlexItems>
          </FlexContainer>
        </div>
      </div>
    </div>
  );
}

export default Player;
