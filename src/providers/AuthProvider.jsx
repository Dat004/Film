import { getDatabase, ref, set, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setLogin,
  setTokenStore,
  setUserInfo,
} from "../redux/slices/authSlice";
import { authSelector } from "../redux/selectors";
import { auth } from "../configs/firebaseConfig";
import AuthContext from "../context/AuthContext";
import { useLocalStorage } from "../hooks";
import configs from "../configs";

function AuthProvider({ children }) {
  const authState = useSelector(authSelector);
  const dispatch = useDispatch();

  const { setItem, getItem } = useLocalStorage();
  const {
    keyConfig: {
      localStorageKey: { token, user_info, is_logged },
    },
  } = configs;

  const { tokenStore, logged, userInfo } = authState;

  const isLogged = getItem(is_logged);
  const userIf = getItem(user_info);
  const tokenSt = getItem(token);

  const value = {
    tk: tokenSt || tokenStore,
    lg: isLogged || logged,
    uf: userIf || userInfo,
  };

  useEffect(() => {
    const db = getDatabase();

    const handleAuthStateChange = async (user) => {
      if (user) {
        const currentUser = {
          ...user.reloadUserInfo,
          phoneNumber: user.phoneNumber,
          uid: user.uid,
        };
        const tokenCurrent = {
          ...user.stsTokenManager,
        };

        try {
          const snapshot = await get(ref(db, `/users/${user.uid}`));
          if (!snapshot.exists()) {
            await set(ref(db, `/users/${user.uid}`), {
              currentUser,
            });
            alert("Add data successfully");

            setItem(user_info, currentUser);
            setItem(is_logged, true);
            setItem(token, tokenCurrent);

            dispatch(setUserInfo(currentUser));
            dispatch(setLogin(true));
            dispatch(setTokenStore(tokenCurrent));
          } else {
            const { currentUser } = snapshot.val();

            setItem(user_info, currentUser);
            setItem(is_logged, true);
            setItem(token, tokenCurrent);

            dispatch(setUserInfo(currentUser));
            dispatch(setLogin(true));
            dispatch(setTokenStore(tokenCurrent));
          }
        } catch (error) {
          console.log(error);
          alert("Failed to add data");
        }
      } else {
        setItem(user_info, {});
        setItem(is_logged, false);
        setItem(token, {});
        dispatch(setUserInfo({}));
        dispatch(setLogin(false));
        dispatch(setTokenStore({}));
      }
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
