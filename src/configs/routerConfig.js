import DetailFilmLayout from "../layouts/DetailFilmLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import router from "../router";
import pages from "../pages";

const routerConfig = [
  {
    id: 1,
    path: router.home,
    component: pages.Home,
    layout: DefaultLayout,
  },
  {
    id: 2,
    path: router.phim,
    component: pages.DetailsFilm,
    layout: DetailFilmLayout,
  },
  {
    id: 3,
    path: router.phim_le,
    component: pages.PhimLe,
    layout: DefaultLayout,
  },
  {
    id: 4,
    path: router.phim_hoat_hinh,
    component: pages.PhimHoatHinh,
    layout: DefaultLayout,
  },
  {
    id: 5,
    path: router.phim_bo,
    component: pages.PhimBo,
    layout: DefaultLayout,
  },
  {
    id: 6,
    path: router.search,
    component: pages.Search,
    layout: DefaultLayout,
  },
  {
    id: 7,
    path: router.tv_show,
    component: pages.TVShows,
    layout: DefaultLayout,
  },
  {
    id: 8,
    path: router.the_loai,
    component: pages.TheLoai,
    layout: DefaultLayout,
  },
  {
    id: 9,
    path: router.quoc_gia,
    component: pages.QuocGia,
    layout: DefaultLayout,
  },
];

export default routerConfig;
