import { CategoryFilmScreen } from "../screens";
import services from "../services";

function TVShows() {
  return (
    <>
      <CategoryFilmScreen request={services.tvShowService} />
    </>
  );
}

export default TVShows;
