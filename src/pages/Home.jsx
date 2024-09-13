import { useEffect, useState } from "react";

import { SliderFilm } from "../components/Slider";
import SEO from "../components/SEO";
import services from "../services";

function Home() {
  const [newData, setNewData] = useState();

  useEffect(() => {
    (async () => {
      const getAllFilm = await services.allDataService();

      setNewData(getAllFilm);
    })();
  }, []);

  return (
    <>
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
    </>
  );
}

export default Home;
