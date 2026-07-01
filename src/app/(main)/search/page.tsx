"use client";

import * as React from "react";
import { useQueryState } from "nuqs";
import { useSearchFilms } from "@/features/film/hooks/use-film-queries";
import CatalogSkeleton from "@/components/Skeleton/CatalogSkeleton";
import { FilmElement } from "@/components/Element";

export default function SearchPage() {
  const [keyword] = useQueryState("keyword", { defaultValue: "" });
  const { data, isLoading, isError } = useSearchFilms(keyword, 20);

  const items = data?.data?.items || [];
  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || "";

  return (
    <div className="mb-[40px] px-4 min-h-[calc(100dvh-200px)]">
      <div className="mb-6">
        <h2 className="text-primary text-[24px] font-semibold">
          Kết quả tìm kiếm cho: <span className="text-hover">"{keyword}"</span>
        </h2>
      </div>

      {isLoading ? (
        <div className="relative min-h-[calc(100dvh-200px)] mask-loading">
          <CatalogSkeleton />
        </div>
      ) : isError ? (
        <div className="text-center text-red-500 py-10">
          Có lỗi xảy ra khi tìm kiếm phim. Vui lòng thử lại!
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-title py-20 text-[18px]">
          Không tìm thấy bộ phim nào phù hợp với từ khóa tìm kiếm của bạn.
        </div>
      ) : (
        <div className="flex flex-wrap mx-[-12px] pb-[24px] items-start">
          {items.map((item) => (
            <div
              className="w-[calc(100%/5)] xsm:w-full ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px]"
              key={item._id}
            >
              <FilmElement data={item} baseUrl={cdnImage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
