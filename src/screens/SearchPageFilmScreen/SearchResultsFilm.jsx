import { Link } from "react-router-dom";

import { FlexContainer, FlexItems } from "../../components/Flex";
import CustomPagination from "../../components/CustomPagination";
import { FilmElement } from "../../components/Element";

function SearchResultsFilm({ data = {}, limit = 20 }) {
  const { APP_DOMAIN_CDN_IMAGE, items, params, seoOnPage, titlePage } = data;
  const {
    pagination: { currentPage, totalPages },
  } = params;

  const keywordsSuggest = seoOnPage?.titleHead?.split(" | ");

  return (
    <>
      {!!items?.length && (
        <>
          {/* <h1 className="text-[32px] text-primary font-medium">{titlePage}</h1> */}
          <FlexContainer className="w-[100%] !gap-y-0 flex-row 2xlm:flex-col">
            <FlexItems className="!flex-grow-0 2xlm:w-[100%] w-[25%] 2xlm:ml-0 ml-[20px] !flex-shrink-0 order-2 2xlm:order-1">
              <FlexContainer className="flex-wrap items-center !gap-y-[15px] mb-[20px]">
                <FlexItems className="mr-[15px]">
                  <span className="text-[14px] text-primary">
                    Từ khóa liên quan:
                  </span>
                </FlexItems>
                {keywordsSuggest?.map((items, index) => (
                  <FlexItems key={index} className="mr-[8px]">
                    <Link
                      to={`/search?value=${items}&limit=${limit}`}
                      className="px-[16px] py-[6px] rounded-[999px] bg-bg-multiport text-[14px] text-primary hover:text-hover"
                    >
                      {items}
                    </Link>
                  </FlexItems>
                ))}
              </FlexContainer>
            </FlexItems>
            <FlexItems className="flex-grow 2xlm:w-[100%] w-[75%] !flex-shrink order-1 2xlm:order-2">
              <FlexContainer
                className="mx-[-12px] pb-[24px] items-start"
                isWrap
              >
                {items?.map((items) => (
                  <FlexItems
                    className="w-[calc(100%/4)] xsm:w-[100%] mdm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] 2xlm:w-[calc(100%/5)] px-[12px]"
                    key={items?._id}
                  >
                    <FilmElement data={items} baseUrl={APP_DOMAIN_CDN_IMAGE} />
                  </FlexItems>
                ))}
              </FlexContainer>
            </FlexItems>
          </FlexContainer>
          <CustomPagination
            startIndex={currentPage}
            activeIndex={1}
            endIndex={totalPages}
          />
        </>
      )}
    </>
  );
}

export default SearchResultsFilm;
