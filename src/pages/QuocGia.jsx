import { useParams } from "react-router-dom";

import { CategoryFilmScreen } from "../screens";
import services from "../services";

function QuocGia() {
  const { quoc_gia } = useParams();

  return (
    <>
      <CategoryFilmScreen
        request={services.countryFilmService}
        params={quoc_gia}
      />
    </>
  );
}

export default QuocGia;
