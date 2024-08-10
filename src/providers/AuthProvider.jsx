import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setAccessToken,
  setLogin,
  setUserInfo,
} from "../redux/slices/authSlice";
import { CustomToastContainer, ToastMessage } from "../components/Toastify";
import { useLocalStorage, useFetchData } from "../hooks";
import { authSelector } from "../redux/selectors";
import AuthContext from "../context/AuthContext";
import services from "../services";
import configs from "../configs";

function AuthProvider({ children }) {
  const auth = useSelector(authSelector);
  const dispatch = useDispatch();

  const { access_token, logged, userInfo } = auth;

  const timeoutRef = useRef(null);

  const { getItem, setItem } = useLocalStorage();
  const {
    keyConfig: {
      localStorageKey: { user, isLogged, accessToken },
    },
  } = configs;
  const token = getItem(accessToken) || "";
  const {
    newData,
    state: { isFetching, isError, isSuccess },
  } = useFetchData(
    services.infoAccountServices,
    "",
    access_token,
    [access_token],
    access_token
  );

  const onError = () => {
    dispatch(setLogin(false));
    dispatch(setUserInfo({}));

    setItem(user, {});
    setItem(isLogged, false);
    ToastMessage.error("Đăng nhập không thành công. Vui lòng đăng nhập lại!");
  };

  const onSuccess = () => {
    dispatch(setLogin(true));
    dispatch(setUserInfo(newData));

    setItem(user, newData);
    setItem(isLogged, true);
    ToastMessage.success("Đăng nhập thành công.");
  };

  useEffect(() => {
    if (!access_token) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (isError) onError();
    }, 1200);
  }, [access_token, isError]);

  useEffect(() => {
    if (!access_token) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (isSuccess) onSuccess();
    }, 1200);
  }, [access_token, isSuccess]);

  useEffect(() => {
    dispatch(setAccessToken(token));

    if (!token) {
      setItem(user, {});
      setItem(isLogged, false);

      dispatch(setUserInfo({}));
      dispatch(setLogin(false));
    } else {
      const logged = getItem(isLogged) || false;
      const info = getItem(user) || {};

      dispatch(setUserInfo(info));
      dispatch(setLogin(logged));
    }
  }, [token]);

  const value = { access_token, logged, userInfo };

  return (
    <AuthContext.Provider value={value}>
      <CustomToastContainer />
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
