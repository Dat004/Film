import { useState, useEffect } from "react";

import { FlexContainer, FlexItems } from "../components/Flex";
import WatchListScreen from "../screens/WatchListScreen";
import { UserAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { HeartIcon } from "../icons";
import data from "../data";

function WatchList() {
  const [type, setType] = useState("all");
  const { list_watching } = UserAuth();
  const [listWatchingData, setListWatchingData] = useState([]);

  useEffect(() => {
    if (type !== "all") {
      setListWatchingData(
        list_watching.filter((watchList) => watchList.title === type)
      );
    } else {
      setListWatchingData(list_watching);
    }
  }, [type, list_watching]);

  const menu = [
    {
      title: "All",
      type: "all",
    },
    ...data.dataList,
  ];

  return (
    <div className="px-[15px]">
      <section className="max-w-[1000px] mx-auto">
        <FlexContainer className="items-center mb-[24px]">
          <i className="text-primary size-[32px] mdm:size-[24px] ccm:size-[20px]">
            <HeartIcon width="100%" height="100%" />
          </i>
          <h1 className="text-primary text-[32px] font-medium mdm:text-[24px] ccm:text-[20px] ml-[10px]">
            Watch Playlist
          </h1>
        </FlexContainer>
        <FlexContainer isWrap className="gap-x-[10px] !gap-y-[12px] mb-[24px]">
          {menu.map((item, index) => (
            <FlexItems key={index}>
              <Button
                onClick={() => setType(item.type)}
                primary={type === item.type}
                outline={type !== item.type}
                className={`text-[14px] px-[15px] ${
                  type === item.type
                    ? "border-[1px] border-solid border-transparent"
                    : "!border-bd-filed-form-color"
                } hover:!text-primary min-w-[90px] h-[36px] py-[10px] !font-medium`}
              >
                {item.title}
              </Button>
            </FlexItems>
          ))}
        </FlexContainer>
        <WatchListScreen isShowTitle={type === "all"} data={listWatchingData} />
      </section>
    </div>
  );
}

export default WatchList;
