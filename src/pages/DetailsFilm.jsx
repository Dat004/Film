import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Player from "../layouts/defaultComponents/Player";
import { useFetchData } from "../hooks";
import services from "../services";

function DetailsFilm() {
  const [data, setData] = useState(null);
  const { film } = useParams();

  const { newData, state } = useFetchData(services.detailsFilmService, film, [
    film,
  ]);
  const { isFetching, isSuccess, isError } = state;

  useEffect(() => {
    setData(newData);
  }, [newData]);

  return (
    <div className="film-detail">
      {(!isFetching || !isError) && isSuccess && data && <Player data={data} />}
    </div>
  );
}

export default DetailsFilm;
