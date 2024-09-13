import { CategoryFilmScreen } from "../screens";
import SEO from "../components/SEO";
import services from "../services";

function TVShows() {
  return (
    <>
      <CategoryFilmScreen request={services.tvShowService} />
      <SEO
        url={window.location.href}
        title="Truyền hình, tv shows đến từ các quốc gia nổi tiếng"
        description="Hãy đến đây để thưởng thức các truyền hình, tv shows của chúng tôi"
      />
    </>
  );
}

export default TVShows;
