const useLocalStorage = () => {
  const getItem = (key) => {
    const item = localStorage.getItem(key);

    return JSON.parse(item);
  };

  const setItem = (key, value) => {
    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "undefined"
    ) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    localStorage.setItem(key, JSON.stringify(value));
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
