import { useEffect, useState } from "react";

import { SliderFilm } from "../components/Slider";
import services from "../services";

function Home() {
  const [newData, setNewData] = useState();

  useEffect(() => {
    (async () => {
      const getAllFilm = await services.allDataService();

      setNewData(getAllFilm);
    })();
  }, []);

  return (
    <>
      {newData?.map((items, index) => (
        <div className="pb-[40px]" key={index}>
          <SliderFilm value={items} title="Phim mới" to="/phim-moi" />
        </div>
      ))}
    </>
  );
}

export default Home;
