import { useParams } from "react-router-dom";

import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function TheLoai() {
  const { the_loai } = useParams();

  return (
    <>
      <CategoryFilmScreen
        request={services.categoryFilmService}
        params={the_loai}
      />
      <SEO
        url={window.location.href}
        title="Kho nội dung phim khổng lồ, đặc sắc - Bao gồm đầy đủ các thể loại cho bạn xem lựa chọn"
        description="Với 1 kho lưu trữ đầy đủ các thể loại phim... chúng tôi cung cấp cho người xem kho thể loại phim khổng lồ. Bạn muốn thể loại nào chúng tôi đưa bạn đầy đủ phim của thể loại đó. Còn ngại ngần gì nữa"
      />
    </>
  );
}

export default TheLoai;
