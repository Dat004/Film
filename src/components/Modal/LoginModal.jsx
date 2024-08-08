import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";
import { useGoogleLogin } from "@react-oauth/google";

import { ToastMessage, CustomToastContainer } from "../Toastify";
import GoogleButtonLogin from "../Button/GoogleButtonLogin";
import { useLocalStorage } from "../../hooks";
import Container from "../Container";
import configs from "../../configs";
import Button from "../Button";
import Modal from "./";

function LoginModal({ onClose = () => {}, isShowModal = false }) {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(true);
  const [isHandling, setIsHandling] = useState(false);
  const [usernameValue, setUsernameValueValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const userNameRef = useRef();
  const passwordRef = useRef();

  const { setItem } = useLocalStorage();

  const {
    keyConfig: {
      localStorageKey: { accessToken },
    },
  } = configs;

  useEffect(() => {
    setDisabledBtn(usernameValue && passwordValue ? false : true);
  }, [usernameValue, passwordValue]);

  const variants = {
    hide: {
      y: "-10%",
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
    },
  };

  const handleTogglePassword = () => {
    setIsShowPassword((state) => !state);
  };

  const login = useGoogleLogin({
    onSuccess: async (CodeResponse) => {
      setIsHandling(true);
      ToastMessage.success("Đăng nhập thành công");

      setItem(accessToken, CodeResponse.access_token);
      setTimeout(() => {
        setIsHandling(false);
        onClose();
      }, 1500);
    },
    onError: (errorResponse) => {
      ToastMessage.success("Đăng nhập thất bại ");
      console.log(errorResponse);
    },
  });

  const handleLogin = () => {
    login();
  };

  return (
    <AnimatePresence>
      {isShowModal && (
        <Modal isShowModal={isShowModal} onClose={onClose}>
          {isHandling && (
            <div className="fixed flex items-center justify-center inset-0 z-[1000] bg-bg-layout-loading">
              <div className="loader"></div>
            </div>
          )}
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            transition="duration-300"
            exit="hide"
          >
            <Container className="mx-auto w-[400px] mdm:w-[85%] kdm:w-[90%] h-[500px]">
              <div className="p-[15px] flex justify-end">
                <Button onClick={onClose} rounded>
                  <RiCloseLargeFill className="text-[18px]" />
                </Button>
              </div>
              <div className="px-[32px] kdm:px-[25px]">
                <div className="mb-[32px]">
                  <h3 className="text-[24.5px] font-bold text-primary">
                    Đăng nhập
                  </h3>
                </div>
                <form method="POST" action="">
                  <div className="flex w-[100%] mb-[16px]">
                    <input
                      ref={userNameRef}
                      onChange={(e) => setUsernameValueValue(e.target.value)}
                      value={usernameValue}
                      name="username"
                      placeholder="Số điện thoại"
                      className="p-[16px] h-[48px] text-[14px] text-primary bg-bg-field flex-grow flex-shrink rounded-[8px]"
                      type="text"
                    />
                  </div>
                  <div className="relative flex w-[100%] mb-[16px]">
                    <input
                      name="password"
                      onChange={(e) => setPasswordValue(e.target.value)}
                      value={passwordValue}
                      ref={passwordRef}
                      placeholder="Mật khẩu"
                      className="p-[16px] pr-[42px] h-[48px] text-[14px] text-primary bg-bg-field flex-grow flex-shrink rounded-[8px]"
                      type={isShowPassword ? "text" : "password"}
                    />
                    <div className="absolute top-1/2 right-[4%] flex items-center justify-center translate-y-[-50%]">
                      <Button
                        type="button"
                        onClick={handleTogglePassword}
                        className="text-[22px] !text-items"
                      >
                        {isShowPassword ? (
                          <FaRegEye className="text-[20px]" />
                        ) : (
                          <FaRegEyeSlash />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-primary text-[14px] mb-[24px]">
                    Quên mật khẩu
                  </p>
                  <Button
                    disabled={disabledBtn}
                    className="rounded-[8px] disabled:!bg-bg-disabled h-[48px] w-[100%] text-[16px] hover:text-primary font-semibold"
                    primary
                  >
                    Đăng nhập
                  </Button>
                  <div className="relative flex items-center justify-center my-[8px]">
                    <p className="relative inline-block px-[12px] text-[12px] text-primary font-medium bg-bg-sidebar z-[2]">
                      Or
                    </p>
                    <span className="absolute top-[50%] left-0 h-px w-[100%] bg-bg-white translate-y-[-50%] pointer-events-none z-[1]"></span>
                  </div>
                  <GoogleButtonLogin
                    type="button"
                    onClick={handleLogin}
                    className="h-[48px] w-[100%]"
                  />
                  <CustomToastContainer />
                </form>
              </div>
            </Container>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
