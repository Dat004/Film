import { createContext, useContext } from "react";

const AuthContext = createContext();

export function UserAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
