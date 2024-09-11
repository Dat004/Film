import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setContinueWatchingData,
  setListWatchingData,
  setTokenStore,
  setUserInfo,
  setLogin,
  setUid,
} from "../redux/slices/authSlice";
import { authSelector } from "../redux/selectors";
import { auth } from "../configs/firebaseConfig";
import AuthContext from "../context/AuthContext";
import { useLocalStorage } from "../hooks";
import configs from "../configs";

function AuthProvider({ children }) {
  const dispatch = useDispatch();

  const {
    tokenStore,
    logged,
    userInfo,
    uid,
    data: { continue_watching, list_watching },
  } = useSelector(authSelector);
  const { setItem, getItem } = useLocalStorage();
  const {
    keyConfig: {
      localStorageKey: { user_info, is_logged },
    },
  } = configs;

  const isLogged = getItem(is_logged);
  const userIf = getItem(user_info);

  useEffect(() => {
    const db = getDatabase();

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
        } catch (e) {}

        const usersRef = ref(db, `users/${user.uid}`);
        const unsubscribeUsers = handleSubscribeRef(usersRef, (value) => {
          setItem(user_info, value.currentUser);
          setItem(is_logged, true);

          dispatch(setUserInfo(value.currentUser));
          dispatch(setTokenStore(tokenCurrent));
          dispatch(setUid(user.uid));
          dispatch(setLogin(true));
        });

        const continueWatchingRef = ref(db, `continue_watching/${user.uid}`);
        const unsubscribeContinueWatching = handleSubscribeRef(
          continueWatchingRef,
          (value) => {
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

        const listWatchingRef = ref(db, `list_video/${user.uid}`);
        const unsubscribeListWatching = handleSubscribeRef(
          listWatchingRef,
          (value) => {
            if (!value) {
              dispatch(setListWatchingData([]));
            } else {
              let watchListArr = [];
              let watchListData = {};
              const data = Object.keys(value).map((key) => value[key]);

              for (let i = 0; i < data.length; i++) {
                const type = data[i].type;

                if (!watchListData[type]) {
                  watchListData[type] = [];
                }

                watchListData[type].push(data[i]);
              }

              for (let i in watchListData) {
                watchListArr.push({
                  title: i,
                  data: watchListData[i],
                });
              }

              dispatch(setListWatchingData(watchListArr || []));
            }
          }
        );

        return () => {
          unsubscribeUsers();
          unsubscribeListWatching();
          unsubscribeContinueWatching();
        };
      } else {
        handleUserLogout();
      }
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);

    return () => unsubscribe();
  }, []);

  const handleSubscribeRef = (ref, callback) => {
    return onValue(ref, (snapshot) => {
      callback(snapshot.val());
    });
  };

  const handleUserLogout = () => {
    setItem(user_info, {});
    setItem(is_logged, false);

    dispatch(setUid(null));
    dispatch(setUserInfo({}));
    dispatch(setLogin(false));
    dispatch(setTokenStore({}));
  };

  const value = {
    continue_watching,
    list_watching,
    lg: isLogged || logged,
    uf: userIf || userInfo,
    tk: tokenStore,
    uid: uid,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
