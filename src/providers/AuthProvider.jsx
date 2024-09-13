import { getDatabase, ref, set, get, onValue } from "firebase/database";
import {
  ref as refStorage,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setContinueWatchingData,
  setListWatchingData,
  setTokenStore,
  setUserInfo,
  setAvatar,
  setLogin,
  setUid,
} from "../redux/slices/authSlice";
import { authSelector } from "../redux/selectors";
import { auth, storage } from "../configs/firebaseConfig";
import AuthContext from "../context/AuthContext";
import { useLocalStorage } from "../hooks";
import configs from "../configs";

function AuthProvider({ children }) {
  const dispatch = useDispatch();

  const {
    tokenStore,
    userInfo,
    avatar,
    logged,
    uid,
    data: { continue_watching, list_watching },
  } = useSelector(authSelector);
  const { setItem, getItem } = useLocalStorage();
  const {
    keyConfig: {
      localStorageKey: { user_info, is_logged, avatar: avatarProfile },
    },
  } = configs;

  const imgPf = getItem(avatarProfile);
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
          uploadImageFromUrl(value.currentUser.photoUrl, user.uid);

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

  const uploadImageFromUrl = async (url, uid) => {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Failed to fetch image.");
      }

      const blob = await res.blob(); // Convert to Blob
      const storageProfileImageRef = refStorage(storage, `profile/${uid}/`);
      const uploadTask = uploadBytes(storageProfileImageRef, blob);

      await uploadTask
        .then(() => {
          getDownloadURL(storageProfileImageRef).then((url) => {
            setItem(avatarProfile, url);
            dispatch(setAvatar(url));
          });
        })
        .catch((err) => console.log(err));
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubscribeRef = (ref, callback) => {
    return onValue(ref, (snapshot) => {
      callback(snapshot.val());
    });
  };

  const handleUserLogout = () => {
    setItem(avatarProfile, null);
    setItem(is_logged, false);
    setItem(user_info, {});

    dispatch(setUid(null));
    dispatch(setUserInfo({}));
    dispatch(setLogin(false));
    dispatch(setTokenStore({}));
  };

  const value = {
    continue_watching,
    list_watching,
    uid,
    avatar: imgPf || avatar,
    lg: isLogged || logged,
    uf: userIf || userInfo,
    tk: tokenStore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
