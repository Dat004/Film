import { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getDatabase, ref, onDisconnect } from "firebase/database";

import {
  resetEpisode,
  resetMovie,
  setMovieData,
} from "../../../redux/slices/videoPlayerSlice";
import { FlexContainer, FlexItems } from "../../../components/Flex";
import { videoPlayerSelector } from "../../../redux/selectors";
import { UserAuth } from "../../../context/AuthContext";
import { useRealtimeDbFirebase } from "../../../hooks";
import EpisodesPlayer from "./EpisodesPlayer";
import DetailFilm from "./DetailFilmPlayer";
import SEO from "../../../components/SEO";
import VideoPlayer from "./VideoPlayer";

function Player({ data = {} }) {
  const watchingDataRef = useRef(null);
  const currentEpisodeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  const dispatch = useDispatch();
  const { setDb, getDb, updateDb } = useRealtimeDbFirebase();
  const { lg, uid, continue_watching } = UserAuth();

  const videoPlayerState = useSelector(videoPlayerSelector);

  const { episode, time } = videoPlayerState;
  const { currentTime, duration } = time;
  const { currentEpisode } = episode;
  const { episodes, movie } = data;
  const { thumb_url, poster_url, name } = movie;

  const dataEpisodes = episodes
    ?.map((items) => items?.server_data)
    ?.find((value) => value);

  useEffect(() => {
    if (currentTime > 10) {
      currentTimeRef.current = currentTime;
      durationRef.current = duration;
    }
  }, [currentTime, duration]);

  useEffect(() => {
    currentTimeRef.current = 0;
  }, [currentEpisode]);

  useEffect(() => {
    if (currentTimeRef.current > 10) {
      currentEpisodeRef.current = currentEpisode;

      watchingDataRef.current = {
        ...movie,
        watching: {
          currentTime: currentTimeRef.current,
          duration: durationRef.current,
          currentEpisode: currentEpisodeRef.current,
          episode_info: {
            ...dataEpisodes[currentEpisodeRef.current],
          },
        },
      };
    }
  }, [currentTimeRef.current, durationRef.current, currentEpisode]);

  useEffect(() => {
    watchingDataRef.current = null;
    currentEpisodeRef.current = 0;
    currentTimeRef.current = 0;
    durationRef.current = 0;

    dispatch(setMovieData(movie));

    return () => {
      if (lg && watchingDataRef.current) handleLogData();

      // Clear store data
      dispatch(resetEpisode());
      dispatch(resetMovie());
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        lg &&
        watchingDataRef.current &&
        currentTimeRef.current > 10
      ) {
        handleDisconnect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleDisconnect = () => {
    const db = getDatabase();
    const dbRef = ref(
      db,
      `/continue_watching/${uid}/${watchingDataRef.current._id}`
    );

    const matchingData = continue_watching.some(
      (item) => item._id === watchingDataRef.current._id
    );

    if (matchingData) {
      onDisconnect(dbRef).update({
        watching: watchingDataRef.current.watching,
      });
    } else {
      onDisconnect(dbRef).set({ ...watchingDataRef.current });
    }
  };

  const handleLogData = async () => {
    const dbRef = `/continue_watching/${uid}/${watchingDataRef.current._id}`;
    await getDb({
      path: dbRef,
      callback: async (snapshot) => {
        if (snapshot?.exists()) {
          await updateDb({
            path: dbRef,
            options: {
              ...watchingDataRef.current,
            },
          });
        } else {
          await setDb({
            path: dbRef,
            options: { ...watchingDataRef.current },
          });
        }
      },
      fallback: (err) => {
        console.log(err);
      },
    });
  };

  return (
    <div className="relative px-[15px] clm:px-0">
      <div className="mx-auto 2xlm:w-width-detail-film-layout-2xlm slm:w-width-detail-film-layout-slm clm:w-width-detail-film-layout-clm">
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              backgroundImage: `url(${thumb_url || poster_url})`,
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
              <VideoPlayer dataEpisodes={dataEpisodes} dataMovie={movie} />
              <EpisodesPlayer dataEpisodes={dataEpisodes} />
            </FlexItems>
            <FlexItems className="w-[25%] pl-[30px] 2xlm:pl-0 2xlm:relative 2xlm:py-[35px] clm:py-[25px] 2xlm:w-[100%] clm:px-[15px] flex-shrink-0 ">
              <DetailFilm dataMovie={movie} />
            </FlexItems>
          </FlexContainer>
        </div>
      </div>
      <SEO
        title={`${movie?.name} - ${dataEpisodes[currentEpisode]?.name}`}
        image={movie?.thumb_url || poster_url}
        description={movie?.content}
        url={window.location.href}
      />
    </div>
  );
}

export default Player;
