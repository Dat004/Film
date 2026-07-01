"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  React.useEffect(() => {
    // If auth state loaded and user is not logged in, redirect to home page
    if (isInitialized && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg-layout">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
}

export default ProtectedRoute;
