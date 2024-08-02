import { useEffect } from "react";
import SearchPageFilmScreen from "../screens/SearchPageFilmScreen";

function Search() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  return <div className="w-[100%]">
    <SearchPageFilmScreen />
  </div>
}

export default Search;
