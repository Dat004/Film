import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { MdClear } from "react-icons/md";

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

  useEffect(() => {
    handleSearchApi();
  }, [valueParams, limitParams]);

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

  const handleSearchApi = () => {
    setLoading(true);
    setData(null);

    (async () => {
      if (!searchValue) return;
      const data = await services.searchFilmService({
        keyword: searchValue,
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
      <section className="bg-search-form rounded-[4px] mb-[42px]">
        <FlexContainer className="items-center py-[8px] px-[15px] clm:px-[12px]">
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
              type="button"
              onClick={handleUpdateParams}
              className="bg-bg-search-btn text-[14px] px-[24px] kdm:px-[16px] kdm:py-[8px] rounded-[4px] py-[10px]"
              disabled={!searchValue}
            >
              Tìm kiếm
            </Button>
          </FlexItems>
        </FlexContainer>
      </section>
      {!loading && !!data && <SearchResultsFilm data={data} limit={limit} />}
    </>
  );
}

export default SearchPageFilmScreen;