import { CategoryFilmScreen } from "../screens";
import services from "../services";

function PhimBo() {
  return (
    <>
      <CategoryFilmScreen request={services.seriesFilmService} />
    </>
  );
}

export default PhimBo;
