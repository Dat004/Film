import { Link } from "react-router-dom";
import { CgClose } from "react-icons/cg";
import { FaPlay } from "react-icons/fa6";
import { getDatabase, ref, remove } from "firebase/database";
import { useDispatch } from "react-redux";

import { FlexContainer, FlexItems } from "../../components/Flex";
import {
  setCurrentEpisode,
  setTimeVideo,
} from "../../redux/slices/videoPlayerSlice";
import Button from "../../components/Button";
import Image from "../../components/Image";
import CurrentTime from "./CurrentTime";

function ContinueWatchingVideoScreen({ data = [], uid = "" }) {
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    (async () => {
      const db = getDatabase();
      const dbRef = ref(db, `/continue_watching/${uid}/${id}`);

      try {
        await remove(dbRef);
      } catch (err) {
        console.error(err);
      }
    })();
  };

  const handleGetCurrentWatchingData = (data) => {
    dispatch(setCurrentEpisode(data.watching.currentEpisode));
    dispatch(setTimeVideo({ key: 'currentTime', value: data.watching.currentTime }));
    dispatch(setTimeVideo({ key: 'duration', value: data.watching.duration }));
  };

  return (
    <div className="w-[100%]">
      <FlexContainer className="!items-start !gap-y-[20px] mx-[-8px]" isWrap>
        {data.map((item) => (
          <FlexItems
            key={item._id}
            onClick={() => handleGetCurrentWatchingData(item)}
            className="w-[20%] clm:w-[25%] mdm:w-[calc(100%/3)] ccm:w-[50%] px-[8px]"
          >
            <div className="group/cards relative">
              <div className="opacity-0 slm:opacity-100 group-hover/cards:opacity-100 absolute top-[2.5%] right-[2.5%] flex items-center justify-center size-[25px] bg-bg-white rounded-[50%] z-[10]">
                <Button
                  onClick={() => handleDelete(item._id)}
                  title="Xóa khỏi danh sách video đang xem"
                  className="!text-dark"
                >
                  <CgClose />
                </Button>
              </div>
              <Link className="relative z-[5]" to={`/phim/${item.slug}`}>
                <section className="w-[100%] h-0 leading-0 pb-[140%] mb-[8px]">
                  <div className="absolute inset-0">
                    <Image cover src={item.poster_url} />
                  </div>
                  <div className="opacity-0 group-hover/cards:opacity-100 flex items-center justify-center transition-opacity duration-200 absolute inset-0 z-10 backdrop-blur-[10px]">
                    <i className="text-[42px] text-primary">
                      <FaPlay />
                    </i>
                  </div>
                </section>
              </Link>
            </div>
            <h3 className="text-[14.3px] font-medium text-primary leading-[1.3] line-clamp-1 mb-[8px]">
              <Link
                to={`/phim/${item.slug}`}
                className="whitespace-normal hover:opacity-80"
              >
                {item.name}
              </Link>
            </h3>
            <div>
              <FlexContainer className="items-baseline">
                <FlexItems>
                  <span className="text-title text-[12px] font-bold uppercase">
                    {item.watching.episode_info.name}
                  </span>
                </FlexItems>
                <FlexItems className="ml-auto !flex-grow-0 !flex-shrink">
                  <FlexContainer className="items-center">
                    <CurrentTime
                      className="!text-primary"
                      currentTime={item.watching.currentTime}
                    />
                    <span className="text-title text-[16px] mx-[4px] font-medium">
                      &#47;
                    </span>
                    <CurrentTime currentTime={item.watching.duration} />
                  </FlexContainer>
                </FlexItems>
              </FlexContainer>
              <div className="relative h-[3px] bg-bg-slider-color my-[5px]">
                <span
                  style={{
                    width: `calc(${
                      (item.watching.currentTime / item.watching.duration) * 100
                    }%)`,
                  }}
                  className="absolute left-0 top-0 h-[100%] bg-bg-green"
                ></span>
              </div>
            </div>
          </FlexItems>
        ))}
      </FlexContainer>
    </div>
  );
}

export default ContinueWatchingVideoScreen;
