import { FlexContainer } from "../components/Flex";
import { HeartIcon } from "../icons";

function WatchList() {
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
      </section>
    </div>
  );
}

export default WatchList;
