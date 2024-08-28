import { Link } from "react-router-dom";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import Paragraph from "../../../../components/Paragraph";
import InfoDisplay from "./InfoDisplay";

function DetailFilm({ dataMovie = {} }) {
  const {
    poster_url,
    name,
    content,
    origin_name,
    country,
    category,
    type,
    status,
    year,
    lang,
    quality,
    episode_total,
    time,
    episode_current,
  } = dataMovie;

  return (
    <div className="relative">
      <div className="w-[100%]">
        <FlexContainer className="flex-col 2xlm:flex-row">
          <FlexItems className="mr-[12px] w-[100px]">
            <div className="relative w-[100%] pb-[148%]">
              <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url(${poster_url})`,
                }}
              ></div>
            </div>
          </FlexItems>
          <FlexItems className="!flex-shrink flex-grow">
            <h2 className="mb-[15px] line-clamp-1 uppercase text-[24px] xlm:text-[20px] mdm:mb-[12px] leading-[1.2] text-primary font-normal">
              {name}
            </h2>
            <div className="hidden 2xlm:block">
              <FlexContainer>
                <FlexItems>
                  <p className="flex items-center leading-[1] text-[14px] text-primary">
                    <span>{year}</span>
                    <span className="inline-block mx-[6px] w-[1px] h-[10px] bg-[rgb(133,135,141)]"></span>
                    <span>{episode_total}</span>
                    <span className="inline-block mx-[6px] w-[1px] h-[10px] bg-[rgb(133,135,141)]"></span>
                    <span className="uppercase text-[14px]">{quality}</span>
                  </p>
                </FlexItems>
              </FlexContainer>
            </div>
            <div className="hidden 2xlm:block">
              <FlexContainer className="my-[14px] h-[24px] overflow-hidden flex-wrap gap-x-[6px]">
                <span className="py-[3px] px-[4px] rounded-[2px] bg-[rgba(255,255,255,0.08)] text-[12px] text-primary font-normal">
                  {lang}
                </span>
                {country?.map((items, index) => (
                  <Link
                    key={index}
                    to={`/quoc-gia/${items?.slug}`}
                    className="py-[3px] px-[4px] rounded-[2px] bg-[rgba(255,255,255,0.08)] text-[12px] text-primary font-normal"
                  >
                    {items?.name}
                  </Link>
                ))}
                {category?.map((items, index) => (
                  <Link
                    key={index}
                    to={`/the-loai/${items?.slug}`}
                    className="py-[3px] px-[4px] rounded-[2px] bg-[rgba(255,255,255,0.08)] text-[12px] text-primary font-normal"
                  >
                    {items?.name}
                  </Link>
                ))}
              </FlexContainer>
            </div>
            <Paragraph lineClamp={1} className="text-[14px] font-light">
              {content ? content.replace(/&quot;/g, '"') : "Đang cập nhật"}
            </Paragraph>
          </FlexItems>
        </FlexContainer>
        <FlexContainer className="mt-[15px] flex-col !gap-y-[10px] 2xlm:hidden">
          <FlexItems className="2xlm:w-[50%] mr-[12px] flex-grow !flex-shrink">
            <InfoDisplay
              data={[
                { key: "Tên gốc", value: origin_name },
                {
                  key: "Thể loại",
                  value: category?.map((items) => items?.name)?.join(", "),
                },
                {
                  key: "Quốc gia",
                  value: country?.map((items) => items?.name)?.join(", "),
                },
                { key: "Loại phim", value: type },
                { key: "Trạng thái", value: status },
                { key: "Năm phát hành", value: year },
              ]}
            />
          </FlexItems>
          <FlexItems className="2xlm:w-[50%] flex-grow !flex-shrink">
            <InfoDisplay
              data={[
                { key: "Phụ đề", value: lang },
                { key: "Chất lượng", value: quality },
                { key: "Tổng số tập", value: episode_total },
                { key: "Thời lượng phim", value: time },
                { key: "Tập phim hiện tại", value: episode_current },
              ]}
            />
          </FlexItems>
        </FlexContainer>
      </div>
    </div>
  );
}

export default DetailFilm;
