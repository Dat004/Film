import { getRequest } from "../configs/axiosConfig";

export const listCategoryService = async () => {
  try {
    const res = await getRequest("the-loai");

    return res;
  } catch (e) {
    return e;
  }
};

export const countryCategoryService = async () => {
  try {
    const res = await getRequest("quoc-gia");

    return res;
  } catch (e) {
    return e;
  }
};
