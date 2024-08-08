const useLocalStorage = () => {
  const getItem = (key) => {
    const item = localStorage.getItem(key);

    return JSON.parse(item);
  };

  const setItem = (key, value) => {
    if (typeof value === "string") {
      localStorage.setItem(key, JSON.stringify(value));

      return;
    }

    const prevItem = getItem(key);
    localStorage.setItem(key, JSON.stringify(Object.assign(prevItem, value)));
  };

  const removeItem = (key) => {
    localStorage.removeItem(key);
  };

  const clearItems = () => {
    localStorage.clear();
  };

  return { getItem, setItem, removeItem, clearItems };
};

export default useLocalStorage;
