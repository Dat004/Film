import { useState, useEffect } from "react";

const useDebounce = (value, delay = "500") => {
  const [debounce, setDebounce] = useState("");

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(value);
    }, delay);

    return () => clearTimeout(timeOut);
  }, [value]);

  return debounce;
};

export default useDebounce;
