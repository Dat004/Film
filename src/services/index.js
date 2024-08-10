import {
  categoryFilmService,
  detailsFilmService,
  countryFilmService,
  allCategoryService,
  searchFilmService,
  singleFilmService,
  seriesFilmService,
  newFilmService,
  cartoonService,
  allDataService,
  tvShowService,
} from "./filmSevice";
import { listCategoryService, countryCategoryService } from "./categoryService";
import { infoAccountServices } from "./googleServices";

const services = {
  countryCategoryService,
  infoAccountServices,
  categoryFilmService,
  countryFilmService,
  listCategoryService,
  detailsFilmService,
  allCategoryService,
  singleFilmService,
  seriesFilmService,
  searchFilmService,
  newFilmService,
  cartoonService,
  allDataService,
  tvShowService,
};

export default services;
