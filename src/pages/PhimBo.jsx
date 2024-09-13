import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function PhimBo() {
  return (
    <>
      <CategoryFilmScreen request={services.seriesFilmService} />
      <SEO
        url={window.location.href}
        title="Mọt Phim Không Thể Bỏ Qua - Phim Bộ Chill Hay Mới Nhất | FPT Play"
        description="Kho phim bộ chill Trung Quốc, Hồng Kông, TVB, Thái Lan, Hàn Quốc, Việt Nam, Âu Mỹ hay mới nhất 2024 dành cho mọt phim, chỉ có tại website của chúng tôi. Xem ngay."
      />
    </>
  );
}

export default PhimBo;
