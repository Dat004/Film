import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import CatalogSkeleton from "../../components/Skeleton/CatalogSkeleton";
import { FlexContainer, FlexItems } from "../../components/Flex";
import CustomPagination from "../../components/CustomPagination";
import SkeletonContainer from "../../components/Skeleton";
import { SliderBanner } from "../../components/Slider";
import { FilmElement } from "../../components/Element";
import { useFetchData } from "../../hooks";

function CategoryFilmScreen({ request, params = "" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParams = searchParams.get("page") ?? 1;
  const limitParams = searchParams.get("limit") ?? 20;

  const [data, setData] = useState(null);
  const [endPage, setEndPage] = useState(null);
  const [page, setPage] = useState(+pageParams);
  const [limit, setLimit] = useState(+limitParams);
  const [dataBanner, setDataBanner] = useState({
    itemsBanner: null,
  });

  const { newData, state } = useFetchData({
    request,
    options: {
      slug: params,
      page,
      limit,
    },
    dependencies: [page, limit, params],
  });
  const { isError, isFetching, isSuccess } = state;

  useEffect(() => {
    if (params) {
      setData(null);
      setDataBanner({ itemsBanner: null });
      setEndPage(null);
      setPage(1);
    }
  }, [params]);

  useEffect(() => {
    setSearchParams({
      page,
      limit,
    });
  }, [page, limit]);

  useEffect(() => {
    setData({ ...newData });
    if (!dataBanner.itemsBanner)
      setDataBanner({
        itemsBanner: newData?.items?.slice(0, 10),
        ...newData,
      });
    if (!endPage) setEndPage(newData?.params?.pagination);
  }, [newData]);

  const handleChangePage = (index) => {
    setPage(index);
  };

  const handleNextPage = () => {
    setPage((state) => (state >= endPage?.totalPages ? state : state + 1));
  };

  const handlePrevPage = () => {
    setPage((state) => (state <= 1 ? state : state - 1));
  };

  const memolizedBanner = useMemo(() => {
    return (
      <>
        {!dataBanner.itemsBanner ? (
          <div className="flex justify-center">
            <div className="relative w-[100%] max-w-[1200px] pb-[56.25%]">
              <section className="absolute inset-0">
                <SkeletonContainer borderRadius={4} />
              </section>
            </div>
          </div>
        ) : (
          <SliderBanner data={dataBanner} />
        )}
      </>
    );
  }, [dataBanner.itemsBanner]);

  const memolizedPagination = useMemo(() => {
    return (
      <>
        {!endPage ? null : (
          <CustomPagination
            activeIndex={page}
            countsPrev={3}
            countsNext={3}
            startIndex={1}
            endIndex={endPage.totalPages}
            onIndex={handleChangePage}
            onNextIndex={handleNextPage}
            onPrevIndex={handlePrevPage}
          />
        )}
      </>
    );
  }, [endPage, page]);

  return (
    <div className="mb-[40px]">
      <div className="mb-[40px]">{memolizedBanner}</div>
      {(!isFetching || !isError) && isSuccess ? (
        <>
          <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
            {data?.items?.map((items) => (
              <FlexItems
                className="w-[calc(100%/5)] xsm:w-[100%] ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px]"
                key={items?._id}
              >
                <FilmElement
                  data={items}
                  baseUrl={data?.APP_DOMAIN_CDN_IMAGE}
                />
              </FlexItems>
            ))}
          </FlexContainer>
        </>
      ) : (
        <div className="relative min-h-[calc(100dvh-90px)] mt-[40px] mask-loading">
          <CatalogSkeleton />
        </div>
      )}
      <>{memolizedPagination}</>
    </div>
  );
}

export default CategoryFilmScreen;
