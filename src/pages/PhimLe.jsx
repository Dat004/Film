import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function PhimLe() {
  return (
    <>
      <CategoryFilmScreen request={services.singleFilmService} />
      <SEO
        url={window.location.href}
        title="Top Phim Lẻ - Phim Hành Động Võ Thuật Hay Mới Nhất 2024"
        description="Kho phim lẻ Hồng Kông, Hàn Quốc, Âu Mỹ, Việt Nam, Trung Quốc hay mới nhất 2024 chỉ có tại website của chúng tôi. Xem ngay."
      />
    </>
  );
}

export default PhimLe;
