import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setLogin,
  setTokenStore,
  setUserInfo,
  setUid,
} from "../redux/slices/authSlice";
import { setContinueWatchingData } from "../redux/slices/continueWatchingSlice";
import { authSelector, continueWatchingSelector } from "../redux/selectors";
import { auth } from "../configs/firebaseConfig";
import AuthContext from "../context/AuthContext";
import { useLocalStorage } from "../hooks";
import configs from "../configs";

function AuthProvider({ children }) {
  const { tokenStore, logged, userInfo, uid } = useSelector(authSelector);
  const { continue_watching } = useSelector(continueWatchingSelector);
  const { setItem, getItem } = useLocalStorage();

  const dispatch = useDispatch();

  const {
    keyConfig: {
      localStorageKey: { user_info, is_logged },
    },
  } = configs;

  const isLogged = getItem(is_logged);
  const userIf = getItem(user_info);

  const value = {
    lg: isLogged || logged,
    uf: userIf || userInfo,
    continue_watching,
    tk: tokenStore,
    uid: uid,
  };
  const db = getDatabase();

  useEffect(() => {
    const handleAuthStateChange = async (user) => {
      if (user) {
        const currentUser = {
          ...user.reloadUserInfo,
          phoneNumber: user.phoneNumber,
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
          }
        } catch (error) {
          console.log(error);
          alert("Failed to add data");
        }

        const usersRef = ref(db, `users/${user.uid}`);
        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
          const value = snapshot.val();

          setItem(user_info, value.currentUser);
          setItem(is_logged, true);

          dispatch(setUserInfo(value.currentUser));
          dispatch(setTokenStore(tokenCurrent));
          dispatch(setUid(user.uid));
          dispatch(setLogin(true));
        });

        const continueWatchingRef = ref(db, `continue_watching/${user.uid}`);
        const unsubscribeContinueWatching = onValue(
          continueWatchingRef,
          (snapshot) => {
            const value = snapshot.val();

            if (!value) {
              dispatch(setContinueWatchingData([]));
            } else {
              dispatch(
                setContinueWatchingData(
                  Object.keys(value).map((key) => value[key])
                )
              );
            }
          }
        );

        return () => {
          unsubscribeUsers();
          unsubscribeContinueWatching();
        };
      } else {
        setItem(user_info, {});
        setItem(is_logged, false);

        dispatch(setUid(null));
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
