import { CategoryFilmScreen } from "../screens";
import services from "../services";

function PhimHoatHinh() {
  return (
    <>
      <CategoryFilmScreen request={services.cartoonService} />
    </>
  );
}

export default PhimHoatHinh;
