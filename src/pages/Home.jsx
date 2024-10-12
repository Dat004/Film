import { useEffect, useState, Fragment } from "react";

import CatalogSkeleton from "../components/Skeleton/CatalogSkeleton";
import { SliderFilm } from "../components/Slider";
import SEO from "../components/SEO";
import services from "../services";

function Home() {
  const [newData, setNewData] = useState(null);
  const [status, setStatus] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  useEffect(() => {
    (async () => {
      setStatus((prev) => ({
        ...prev,
        isError: false,
        isLoading: true,
        isSuccess: false,
      }));

      const getAllFilm = await services.allDataService();

      if (getAllFilm?.isError) {
        setStatus((prev) => ({
          ...prev,
          isError: true,
          isLoading: false,
          isSuccess: false,
        }));
        setNewData(null);

        return;
      }

      setStatus((prev) => ({
        ...prev,
        isError: false,
        isLoading: false,
        isSuccess: true,
      }));
      setNewData(getAllFilm);
    })();
  }, []);

  return (
    <>
      {status.isSuccess && (!status.isError || !status.isLoading) ? (
        <Fragment>
          {newData?.map((items, index) => (
            <div className="pb-[40px]" key={index}>
              <SliderFilm value={items} title="Phim mới" to="/phim-moi" />
            </div>
          ))}
          <SEO
            url={window.location.href}
            title="Xem Không Giới Hạn Phim, Show, Anime, TV, Thể Thao"
            description="Chào mừng bạn đến với web xem phim của tôi, điểm đến tuyệt vời dành cho những người yêu thích phim ảnh! Tại đây, bạn có thể khám phá một kho tàng phim đa dạng từ khắp nơi trên thế giới, từ những bộ phim bom tấn Hollywood cho đến những tác phẩm điện ảnh độc lập đầy ấn tượng."
          />
        </Fragment>
      ) : (
        <div className="relative min-h-[calc(100dvh-90px)] mt-[40px] mask-loading">
          <CatalogSkeleton />
        </div>
      )}
    </>
  );
}

export default Home;
