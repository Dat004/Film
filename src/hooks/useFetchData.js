import { useState, useEffect } from "react";

const useFetchData = (request, path = "", params = {}, dependencies = []) => {
  const [state, setState] = useState({
    isFetching: false,
    isError: false,
    isSuccess: false,
  });
  const [newData, setNewData] = useState(null);

  useEffect(() => {
    setNewData(null);
    setState((prevState) => ({
      ...prevState,
      isFetching: true,
      isError: false,
      isSuccess: false,
    }));

    (async () => {
      const data = await request(path, params);

      if(Array.isArray(data)) {
        setState((prevState) => ({
          ...prevState,
          isFetching: false,
          isError: false,
          isSuccess: true,
        }));
        setNewData(data);
      }

      if (data.status >= 200 && data.status < 300) {
        setState((prevState) => ({
          ...prevState,
          isFetching: false,
          isError: false,
          isSuccess: true,
        }));
        setNewData(data?.data?.data || data?.data);
      } else if (
        (data.status >= 400 && data.status < 500) ||
        (data.status >= 500 && data.status < 600)
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
  }, [...dependencies]);

  return { state, newData };
};

export default useFetchData;
