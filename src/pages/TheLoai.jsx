import { useParams } from "react-router-dom";

import { CategoryFilmScreen } from "../screens";
import services from "../services";

function TheLoai() {
  const { the_loai } = useParams();

  return (
    <>
      <CategoryFilmScreen
        request={services.categoryFilmService}
        params={the_loai}
      />
    </>
  );
}

export default TheLoai;
