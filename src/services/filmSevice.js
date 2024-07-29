import { getRequest, getAllRequest } from "../configs/axiosConfig";

export const allDataService = async () => {
  const paths = [
    "danh-sach/phim-moi-cap-nhat",
    "v1/api/danh-sach/phim-le",
    "v1/api/danh-sach/phim-bo",
    "v1/api/danh-sach/hoat-hinh",
    "v1/api/danh-sach/tv-shows",
  ];

  try {
    const res = await getAllRequest(paths);

    return res;
  } catch (e) {
    return e;
  }
};

export const allCategoryService = async () => {
  const paths = ["the-loai", "quoc-gia"];

  try {
    const res = await getAllRequest(paths);

    return res;
  } catch (e) {
    return e;
  }
};

export const detailsFilmService = async (slugFilm) => {
  try {
    const res = await getRequest(`phim/${slugFilm}`);

    return res;
  } catch (e) {
    return e;
  }
};

export const searchFilmService = async ({ keyword, limit = 10 }) => {
  try {
    const res = await getRequest("v1/api/tim-kiem", {
      params: {
        keyword,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const newFilmService = async (page = 1) => {
  try {
    const res = await getRequest("danh-sach/phim-moi-cap-nhat", {
      params: {
        page,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const singleFilmService = async (_, { page = 1, limit = 20 }) => {
  try {
    const res = await getRequest("v1/api/danh-sach/phim-le", {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const seriesFilmService = async (_, { page = 1, limit = 20 }) => {
  try {
    const res = await getRequest("v1/api/danh-sach/phim-bo", {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const cartoonService = async (_, { page = 1, limit = 20 }) => {
  try {
    const res = await getRequest("v1/api/danh-sach/hoat-hinh", {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const tvShowService = async (_, { page = 1, limit = 20 }) => {
  try {
    const res = await getRequest("v1/api/danh-sach/tv-shows", {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const countryFilmService = async (
  _,
  { slug = "viet-nam", page = 1, limit = 20 }
) => {
  try {
    const res = await getRequest(`v1/api/quoc-gia/${slug}`, {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};

export const categoryFilmService = async (
  _,
  { slug = "hanh-dong", page = 1, limit = 20 }
) => {
  try {
    const res = await getRequest(`v1/api/the-loai/${slug}`, {
      params: {
        page,
        limit,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};
