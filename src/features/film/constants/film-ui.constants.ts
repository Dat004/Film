export const FILM_UI_COPY = {
  watchNow: 'Xem ngay',
  trailer: 'Trailer',
  theatrical: 'Chiếu rạp',
  relatedFilms: 'Phim liên quan',
  watchListEmptyTitle: 'Danh sách trống',
  watchListEmptyDescription:
    'Bạn chưa thêm phim nào vào danh sách. Hãy khám phá và lưu lại những bộ phim yêu thích nhé!',
  continueWatchingEmptyTitle: 'Chưa có lịch sử xem',
  continueWatchingEmptyDescription:
    'Bạn chưa xem bộ phim nào gần đây. Hãy chọn một bộ phim và bắt đầu thưởng thức nhé!',
  removeFromWatchList: 'Xóa khỏi danh sách phát',
  addToWatchList: 'Thêm vào danh sách phát',
  removeFromContinueWatching: 'Xóa khỏi danh sách video đang xem',
} as const;

export type FilmUiCopyKey = keyof typeof FILM_UI_COPY;
