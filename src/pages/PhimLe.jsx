import { CategoryFilmScreen } from "../screens";
import services from "../services";

function PhimLe() {
  return (
    <>
      <CategoryFilmScreen request={services.singleFilmService} />
    </>
  );
}

export default PhimLe;
