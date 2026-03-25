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

  const infoPrimary = [
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
  ];

  const infoSecondary = [
    { key: "Phụ đề", value: lang },
    { key: "Chất lượng", value: quality },
    { key: "Tổng số tập", value: episode_total },
    { key: "Thời lượng phim", value: time },
    { key: "Tập phim hiện tại", value: episode_current },
  ];

  return (
    <div className="relative detail-film-panel w-full">
      <FlexContainer className="flex flex-col items-center gap-[18px] mdm:gap-[20px] detail769:flex-row detail769:items-start detail769:gap-[24px]">
        <FlexItems className="flex w-full shrink-0 justify-center detail769:w-auto detail769:justify-start">
          <div className="detail-film-poster relative w-[100px] pb-[148%] rounded-[8px] overflow-hidden ring-1 ring-[rgba(15,23,42,0.1)]">
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${poster_url})`,
              }}
            ></div>
          </div>
        </FlexItems>
        <FlexItems className="w-full min-w-0 space-y-[12px] detail769:flex-1">
          <h2 className="line-clamp-2 w-full text-center uppercase text-[22px] xlm:text-[20px] mdm:text-[18px] leading-[1.25] text-primary font-semibold tracking-tight detail769:text-left">
            {name}
          </h2>
          <p className="flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[4px] text-[13px] text-secondary detail769:justify-start">
            <span>{year}</span>
            <span className="text-title opacity-50">·</span>
            <span>{episode_total}</span>
            <span className="text-title opacity-50">·</span>
            <span className="uppercase">{quality}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-[6px] detail769:justify-start">
            <span
              aria-label={lang}
              className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary"
            >
              {lang}
            </span>
            {country?.map((items, index) => (
              <Link
                key={index}
                aria-label={items?.name}
                to={`/quoc-gia/${items?.slug}`}
                className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary hover:text-hover transition-colors"
              >
                {items?.name}
              </Link>
            ))}
            {category?.map((items, index) => (
              <Link
                key={index}
                aria-label={items?.name}
                to={`/the-loai/${items?.slug}`}
                className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary hover:text-hover transition-colors"
              >
                {items?.name}
              </Link>
            ))}
          </div>
          <Paragraph lineClamp={3} className="text-[14px] font-normal !text-secondary leading-relaxed">
            {content ? content.replace(/&quot;/g, '"') : "Đang cập nhật"}
          </Paragraph>
        </FlexItems>
      </FlexContainer>

      <div className="detail-film-meta-section mt-[22px] pt-[22px] border-t border-solid border-bd-filed-form-color">
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-x-[28px] gap-y-0">
          <InfoDisplay data={infoPrimary} />
          <InfoDisplay data={infoSecondary} />
        </div>
      </div>
    </div>
  );
}

export default DetailFilm;
