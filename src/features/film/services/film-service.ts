import { getRequest, getAllRequest } from "@/lib/axios";
import { Pagination, FilmItem, FilmListResponse, FilmDetailResponse } from "@/types";

export type { Pagination, FilmItem, FilmListResponse, FilmDetailResponse };

export const filmService = {
  allDataService: async () => {
    const paths = [
      "danh-sach/phim-moi-cap-nhat",
      "v1/api/danh-sach/phim-le",
      "v1/api/danh-sach/phim-bo",
      "v1/api/danh-sach/hoat-hinh",
      "v1/api/danh-sach/tv-shows",
    ];
    try {
      const res = await getAllRequest(paths);
      return res; // Returns an array of responses
    } catch (e) {
      throw new Error("Lỗi khi tải dữ liệu phim tổng hợp");
    }
  },

  allCategoryService: async () => {
    const paths = ["the-loai", "quoc-gia"];
    try {
      const res = await getAllRequest(paths);
      return res;
    } catch (e) {
      throw new Error("Lỗi khi tải danh mục thể loại và quốc gia");
    }
  },

  detailsFilmService: async (slugFilm: string): Promise<FilmDetailResponse> => {
    try {
      const res = await getRequest(`phim/${slugFilm}`);
      return res.data;
    } catch (e) {
      throw new Error(`Lỗi khi tải chi tiết phim: ${slugFilm}`);
    }
  },

  searchFilmService: async (keyword: string, limit = 10): Promise<FilmListResponse> => {
    try {
      const res = await getRequest("v1/api/tim-kiem", {
        params: {
          keyword,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error(`Lỗi khi tìm kiếm phim với từ khóa: ${keyword}`);
    }
  },

  newFilmService: async (page = 1) => {
    try {
      const res = await getRequest("danh-sach/phim-moi-cap-nhat", {
        params: {
          page,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Lỗi khi tải danh sách phim mới cập nhật");
    }
  },

  singleFilmService: async (page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest("v1/api/danh-sach/phim-le", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Lỗi khi tải danh sách phim lẻ");
    }
  },

  seriesFilmService: async (page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest("v1/api/danh-sach/phim-bo", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Lỗi khi tải danh sách phim bộ");
    }
  },

  cartoonService: async (page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest("v1/api/danh-sach/hoat-hinh", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Lỗi khi tải danh sách phim hoạt hình");
    }
  },

  tvShowService: async (page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest("v1/api/danh-sach/tv-shows", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error("Lỗi khi tải danh sách TV Show");
    }
  },

  countryFilmService: async (slug = "viet-nam", page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest(`v1/api/quoc-gia/${slug}`, {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error(`Lỗi khi tải danh sách phim quốc gia: ${slug}`);
    }
  },

  categoryFilmService: async (slug = "hanh-dong", page = 1, limit = 20): Promise<FilmListResponse> => {
    try {
      const res = await getRequest(`v1/api/the-loai/${slug}`, {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    } catch (e) {
      throw new Error(`Lỗi khi tải danh sách phim thể loại: ${slug}`);
    }
  },
};
