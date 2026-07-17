'use client';

const useLocalStorage = () => {
  const getItem = <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  };

  const setItem = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  };

  const removeItem = (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  };

  const clearItems = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  };

  return { getItem, setItem, removeItem, clearItems };
};

export default useLocalStorage;
