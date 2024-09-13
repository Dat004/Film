import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function PhimHoatHinh() {
  return (
    <>
      <CategoryFilmScreen request={services.cartoonService} />
      <SEO
        url={window.location.href}
        title="Anime Hay Vietsub - Lồng Tiếng | Xem Phim Anime Mới Nhất"
        description="Xem phim Anime hay mới nhất 2024, Anime kinh điển, Anime gì cũng có, trọn bộ miễn phí, âm thanh chất lượng cao, hình ảnh Full HD chỉ có tại website của chúng tôi."
      />
    </>
  );
}

export default PhimHoatHinh;
