import { Fragment } from "react";

import HeaderContainer from "../../components/Container/HeaderContainer";
import { FlexContainer, FlexItems } from "../../components/Flex";
import { FilmElement } from "../../components/Element";

function WatchListScreen({ data = [], isShowTitle = false }) {
  return (
    <>
      {data.map((item, index) => (
        <Fragment key={index}>
          {isShowTitle && (
            <HeaderContainer title={item.title?.split("-").join(" ")} />
          )}
          <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
            {item?.data?.map((value) => (
              <FlexItems
                className="w-[calc(100%/5)] xsm:w-[100%] ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px]"
                key={value?._id}
              >
                <FilmElement data={value} />
              </FlexItems>
            ))}
          </FlexContainer>
        </Fragment>
      ))}
    </>
  );
}

export default WatchListScreen;
