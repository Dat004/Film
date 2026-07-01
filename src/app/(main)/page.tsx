import * as React from "react";
import { Metadata } from "next";
import { filmService } from "@/features/film/services/film-service";
import FilmSliderHome from "@/components/film/film-slider-home";

export const metadata: Metadata = {
  title: "Xem Phim Online | Xem Không Giới Hạn Phim Hay",
  description: "Trang web xem phim trực tuyến hàng đầu, đồng hành cùng bạn xem các phim hành động, viễn tưởng, anime hay mới nhất.",
};

export default async function HomePage() {
  try {
    const filmsList = await filmService.allDataService();

    if (!filmsList || filmsList.length === 0) {
      return (
        <div className="text-center py-20 text-secondary">
          Hiện chưa có dữ liệu phim. Vui lòng quay lại sau!
        </div>
      );
    }

    return (
      <div className="w-full">
        {filmsList.map((items: any, index: number) => (
          <div className="pb-[40px]" key={items?._id || index}>
            <FilmSliderHome value={items} title={items?.title || "Phim mới"} to={items?.to || "/phim-moi"} />
          </div>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-20 text-secondary">
        Đã xảy ra lỗi khi tải danh sách phim. Vui lòng thử lại sau!
      </div>
    );
  }
}
