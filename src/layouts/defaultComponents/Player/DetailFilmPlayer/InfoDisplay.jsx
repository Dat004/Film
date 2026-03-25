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
    <div className="detail-film-meta-col divide-y divide-bd-filed-form-color">
      {data?.map((items, index) => {
        return (
          <p
            key={index}
            className="flex flex-col gap-[2px] py-[12px] text-[13px] leading-[1.45] sm:flex-row sm:items-baseline sm:gap-[10px] sm:py-[10px]"
          >
            <span className="shrink-0 text-[12px] font-medium text-title sm:min-w-[120px]">
              {items?.key}:
            </span>
            <span className="min-w-0 text-primary whitespace-pre-wrap">
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
    </div>
  );
}

export default InfoDisplay;
