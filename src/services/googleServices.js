import { getGoogleRequest } from "../configs/axiosConfig";

export const infoAccountServices = async (path, token) => {
  try {
    const res = await getGoogleRequest(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  } catch (e) {
    return e;
  }
};
