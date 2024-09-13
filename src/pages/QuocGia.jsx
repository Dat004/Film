import { useParams } from "react-router-dom";

import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function QuocGia() {
  const { quoc_gia } = useParams();

  return (
    <>
      <CategoryFilmScreen
        request={services.countryFilmService}
        params={quoc_gia}
      />
      <SEO
        url={window.location.href}
        title="Các bộ phim hay, chọn lọc - Đến từ rất nhiều các quốc gia"
        description="Khi đến với website của chúng tôi, bạn sẽ rất choáng ngợp khi có rất nhiều bộ phim, hoạt hình... đến từ mọi quốc gia có nền điện ảnh nổi tiếng trên thế giới. Với kho phim khổng lồ này thì còn chần chừ gì nữa. Hãy đón xem"
      />
    </>
  );
}

export default QuocGia;
