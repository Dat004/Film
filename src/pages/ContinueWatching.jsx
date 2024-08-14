import { FlexContainer } from "../components/Flex";
import { HistoryIcon } from "../icons";

function ContinueWatching() {
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
      </section>
    </div>
  );
}

export default ContinueWatching;