'use client';

import { useState, useEffect } from 'react';

const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debounce, setDebounce] = useState<T>(value);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(value);
    }, delay);

    return () => clearTimeout(timeOut);
  }, [value, delay]);

  return debounce;
};

export default useDebounce;
