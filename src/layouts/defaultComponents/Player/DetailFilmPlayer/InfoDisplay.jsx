function InfoDisplay({ data = [] }) {
  const typeFilm = {
    typeSingle: "single",
    typeSeries: "series",
    typeCartoon: "hoathinh",
    typeTvShow: "tvshows",
  };

  const typeStatus = {
    typeCompleted: "completed",
    typeOnGoing: "ongoing",
  };

  const dataDisplay = {
    typeFilmDisplay: {
      singleDisplay: "Phim lẻ",
      seriesDisplay: "Phim bộ",
      cartoonDisplay: "Phim hoạt hình",
      tvShowsDisplay: "TV shows",
    },
    statusFilm: {
      completedDisplay: "Hoàn thành",
      onGoingDisplay: "Đang phát hành",
    },
  };

  return (
    <>
      {data?.map((items, index) => {
        return (
          <p key={index} className="text-[14px] text-title">
            <span>{items?.key}: </span>
            <span className="text-primary whitespace-pre-wrap">
              {(items?.value === typeFilm.typeSingle &&
                dataDisplay.typeFilmDisplay.singleDisplay) ||
                (items?.value === typeFilm.typeSeries &&
                  dataDisplay.typeFilmDisplay.seriesDisplay) ||
                (items?.value === typeFilm.typeCartoon &&
                  dataDisplay.typeFilmDisplay.cartoonDisplay) ||
                (items?.value === typeFilm.typeTvShow &&
                  dataDisplay.typeFilmDisplay.tvShowsDisplay) ||
                (items?.value === typeStatus.typeCompleted &&
                  dataDisplay.statusFilm.completedDisplay) ||
                (items?.value === typeStatus.typeOnGoing &&
                  dataDisplay.statusFilm.onGoingDisplay) ||
                items?.value}
            </span>
          </p>
        );
      })}
    </>
  );
}

export default InfoDisplay;
