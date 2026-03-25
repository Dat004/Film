import { createContext, useContext } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  
  return ctx;
}

export default ThemeContext;

