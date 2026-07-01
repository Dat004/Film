"use client";

import * as React from "react";
import { useAuthListener } from "../hooks/use-auth-listener";

interface AuthListenerProviderProps {
  children: React.ReactNode;
}

export function AuthListenerProvider({ children }: AuthListenerProviderProps) {
  // Initialize the authentication listener
  useAuthListener();

  return <>{children}</>;
}

export default AuthListenerProvider;
