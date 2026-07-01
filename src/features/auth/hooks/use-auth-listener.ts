import * as React from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "../stores/auth-store";
import { setCookie, deleteCookie } from "@/lib/cookies";

export function useAuthListener() {
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const setUid = useAuthStore((state) => state.setUid);
  const setLogin = useAuthStore((state) => state.setLogin);
  const setAvatar = useAuthStore((state) => state.setAvatar);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const logout = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userInfo = {
          uid: user.uid,
          displayName: user.displayName || "User",
          photoUrl: user.photoURL || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || undefined,
        };
        
        // Sync states to Zustand
        setUserInfo(userInfo);
        setUid(user.uid);
        setLogin(true);
        setAvatar(user.photoURL);
        setInitialized(true);

        // Sync state to edge-readable cookie
        setCookie("is_logged_session", "true", 7);
      } else {
        // User is logged out
        logout();
        deleteCookie("is_logged_session");
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUserInfo, setUid, setLogin, setAvatar, setInitialized, logout]);
}
