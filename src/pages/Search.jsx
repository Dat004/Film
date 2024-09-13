import { useEffect } from "react";

import SearchPageFilmScreen from "../screens/SearchPageFilmScreen";
import SEO from "../components/SEO";

function Search() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="w-[100%]">
      <SearchPageFilmScreen />
      <SEO
        url={window.location.href}
        title="Tìm kiếm phim"
        description="Với kho phim khổng lồ, rất nhiều bộ phim chưa được xem và đang được chờ bạn tìm kiếm. Hãy tìm kiếm bộ phim ưa thích của bạn và thưởng thức thôi nào"
      />
    </div>
  );
}

export default Search;
