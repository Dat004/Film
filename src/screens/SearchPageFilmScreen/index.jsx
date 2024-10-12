import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { MdClear } from "react-icons/md";

import SearchPageSkeleton from "../../components/Skeleton/SearchPageSkeleton";
import { FlexContainer, FlexItems } from "../../components/Flex";
import SearchResultsFilm from "./SearchResultsFilm";
import Button from "../../components/Button";
import services from "../../services";

function SearchPageFilmScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const valueParams = searchParams.get("value") ?? "";
  const limitParams = searchParams.get("limit") ?? 20;

  const [searchValue, setSearchValue] = useState(valueParams);
  const [limit, setLimit] = useState(+limitParams);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const searchRef = useRef();
  const prevValueRef = useRef("");

  useEffect(() => {
    setSearchValue(valueParams);
    setLimit(+limitParams);

    if (!valueParams) return;

    handleSearchApi(valueParams, limitParams);
  }, [valueParams, limitParams]);

  useEffect(() => {
    prevValueRef.current = searchValue;
  }, [searchValue]);

  const handleChangeValue = (e) => {
    const value = e.target.value;

    if (value.startsWith(" ")) return;

    setSearchValue(value);
  };

  const handleClearValue = () => {
    setSearchValue("");

    searchRef.current.focus();
  };

  const handleUpdateParams = () => {
    setSearchParams({
      value: searchValue,
      limit: limit,
    });
  };

  const handleSearchApi = (value, limit) => {
    setLoading(true);
    setData(null);

    (async () => {
      if (!value) return;
      const data = await services.searchFilmService({
        keyword: value,
        limit: limit,
      });

      if (data.status >= 200 && data.status < 300) {
        setLoading(false);
        setData(data?.data?.data || data?.data);
      } else if (
        (data.status >= 400 && data.status < 500) ||
        (data.status >= 500 && data.status < 600)
      ) {
        setLoading(true);
        setData(null);
      }

      searchRef.current.focus();
    })();
  };

  return (
    <>
      <div>
        <form className="pb-[42px]">
          <FlexContainer className="items-center py-[8px] bg-search-form rounded-[4px] px-[15px] clm:px-[12px]">
            <FlexItems className=" flex-grow !flex-shrink">
              <FlexContainer className="relative items-center">
                <FlexItems className="!flex-grow-0">
                  <i className="text-primary text-[20px]">
                    <IoSearchOutline />
                  </i>
                </FlexItems>
                <FlexItems className="w-[100%] !flex-shrink">
                  <div className="clm:px-[12px] px-[15px]">
                    <input
                      type="text"
                      name="search"
                      ref={searchRef}
                      value={searchValue}
                      autoComplete="off"
                      onChange={handleChangeValue}
                      className="w-[100%] text-[14px] text-primary"
                      placeholder="Nhập tên phim, kênh, sự kiện..."
                    />
                  </div>
                </FlexItems>
                {searchValue && (
                  <FlexItems className="flex-grow-0">
                    <Button onClick={handleClearValue} type="button">
                      <i>
                        <MdClear />
                      </i>
                    </Button>
                  </FlexItems>
                )}
              </FlexContainer>
            </FlexItems>
            <FlexItems className="ml-[15px] clm:ml-[12px] !flex-grow-0 !flex-shrink-0">
              <Button
                aria-label="search-btn"
                type="submit"
                onClick={handleUpdateParams}
                className="bg-bg-search-btn text-[14px] px-[24px] kdm:px-[16px] kdm:py-[8px] rounded-[4px] py-[10px]"
                disabled={
                  !searchValue || !(prevValueRef.current !== searchValue)
                }
              >
                Tìm kiếm
              </Button>
            </FlexItems>
          </FlexContainer>
        </form>
      </div>
      {!loading && !!data && <SearchResultsFilm data={data} limit={limit} />}
      {loading && !data && (
        <div className="min-w-[calc(100dvh-90px)] mask-loading">
          <SearchPageSkeleton />
        </div>
      )}
    </>
  );
}

export default SearchPageFilmScreen;
