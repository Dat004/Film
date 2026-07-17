import React, { Fragment } from 'react';

import routes from '@/constants/routes';
import { SliderFilm, SliderBanner, allDataService, fetchHomeBannerData } from '@/features/film';

const HOME_ROWS = [
  { title: 'Phim mới', to: routes.phim_moi },
  { title: 'Phim lẻ', to: routes.phim_le },
  { title: 'Phim bộ', to: routes.phim_bo },
  { title: 'Hoạt hình', to: routes.phim_hoat_hinh },
  { title: 'TV Shows', to: routes.tv_show },
] as const;

export default async function HomePage() {
  let newData: unknown[] | null = null;
  let bannerData: Awaited<ReturnType<typeof fetchHomeBannerData>> = { itemsBanner: null };

  try {
    [newData, bannerData] = await Promise.all([allDataService(), fetchHomeBannerData()]);
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-primary text-center">
        <h3 className="text-xl font-bold mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-[15px] opacity-70">
          Không thể tải danh sách phim. Vui lòng thử lại sau!
        </p>
      </div>
    );
  }

  return (
    <Fragment>
      {bannerData.itemsBanner?.length ? (
        <div className="pb-[40px]">
          <SliderBanner data={bannerData} />
        </div>
      ) : null}
      {newData?.map((items: unknown, index) => {
        const row = HOME_ROWS[index] ?? HOME_ROWS[0];
        return (
          <div className="pb-[40px]" key={row.to}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SliderFilm value={items as any} title={row.title} to={row.to} />
          </div>
        );
      })}
    </Fragment>
  );
}
