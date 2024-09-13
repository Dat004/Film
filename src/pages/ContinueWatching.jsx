import ContinueWatchingVideoScreen from "../screens/ContinueWatchingVideoScreen";
import { FlexContainer } from "../components/Flex";
import { UserAuth } from "../context/AuthContext";
import { HistoryIcon } from "../icons";
import SEO from "../components/SEO";

function ContinueWatching() {
  const { continue_watching, uid } = UserAuth();

  return (
    <div className="px-[15px]">
      <section className="max-w-[1000px] mx-auto">
        <FlexContainer className="items-center mb-[24px]">
          <i className="text-primary size-[32px] mdm:size-[24px] ccm:size-[20px]">
            <HistoryIcon width="100%" height="100%" />
          </i>
          <h1 className="text-primary text-[32px] font-medium mdm:text-[24px] ccm:text-[20px] ml-[10px]">
            Continue Watching
          </h1>
        </FlexContainer>
        <ContinueWatchingVideoScreen data={continue_watching} uid={uid} />
      </section>
      <SEO
        title="Bộ phim đang xem"
        url={window.location.href}
        description="Tại đây bạn có thể quản lý được các nội dung đang xem dở của mình"
      />
    </div>
  );
}

export default ContinueWatching;
