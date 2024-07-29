import axios from "axios";

const BASE_URL = "https://phimapi.com/";

const defaultRequest = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

export const getRequest = async (path = "", options =  {}) => {
  const response = await defaultRequest.get(path, options);

  return response;
};

export const getAllRequest = async (paths = []) => {
  const requests = paths.map((path) => defaultRequest.get(path));

  try {
    // Sử dụng axios.all để gửi các yêu cầu đồng thời
    const responses = await axios.all(requests);

    // Trả về một mảng các phản hồi
    return responses.map((response) => response.data);
  } catch (error) {
    return error;
  }
};
