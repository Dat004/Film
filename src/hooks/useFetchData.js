import { useState, useEffect } from "react";

const useFetchData = ({
  request,
  path = "",
  options = {},
  dependencies = [],
  condition = true,
}) => {
  const [state, setState] = useState({
    isFetching: false,
    isError: false,
    isSuccess: false,
  });
  const [newData, setNewData] = useState(null);

  useEffect(() => {
    if (!condition) return;

    setNewData(null);
    setState({
      isFetching: false,
      isError: false,
      isSuccess: false,
    });

    (async () => {
      const data = await request(path, options);

      if (Array.isArray(data)) {
        setState((prevState) => ({
          ...prevState,
          isFetching: false,
          isError: false,
          isSuccess: true,
        }));
        setNewData(data);
      }

      if (
        (data.status >= 200 || data?.response?.status >= 200) &&
        (data.status < 300 || data?.response?.status < 300)
      ) {
        setState((prevState) => ({
          ...prevState,
          isFetching: false,
          isError: false,
          isSuccess: true,
        }));
        setNewData(data?.data?.data || data?.data);
      } else if (
        ((data.status >= 400 || data?.response?.status >= 400) &&
          (data.status < 500 || data?.response?.status < 500)) ||
        ((data.status >= 500 || data?.response?.status >= 500) &&
          (data.status < 600 || data?.response?.status < 600)) ||
        typeof data.data === "string"
      ) {
        setState((prevState) => ({
          ...prevState,
          isFetching: false,
          isError: true,
          isSuccess: false,
        }));
        setNewData(null);
      }
    })();
  }, [...dependencies, condition]);

  return { state, newData };
};

export default useFetchData;
