"use client";

import * as React from "react";
import { signInWithPopup } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { authService } from "../services/auth-service";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";

interface LoginModalProps {
  onClose?: () => void;
  isShowModal?: boolean;
}

export function LoginModal({ onClose = () => {}, isShowModal = false }: LoginModalProps) {
  const [isShowPassword, setIsShowPassword] = React.useState(false);
  const [disabledBtn, setDisabledBtn] = React.useState(true);
  const [usernameValue, setUsernameValue] = React.useState("");
  const [passwordValue, setPasswordValue] = React.useState("");

  const userNameRef = React.useRef<HTMLInputElement | null>(null);
  const passwordRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
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

  const onSuccess = () => {
    toast.success("Đăng nhập thành công!");
    onClose();
  };

  const onError = () => {
    toast.error("Đăng nhập không thành công. Vui lòng đăng nhập lại!");
  };

  const handleLogin = async () => {
    try {
      await authService.signInWithGoogle();
      onSuccess();
    } catch (err) {
      console.error("Login error:", err);
      onError();
    }
  };

  return (
    <AnimatePresence>
      {isShowModal && (
        <Modal onClose={onClose}>
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            transition={{ duration: 0.3 }}
            exit="hide"
          >
            <div className="modal-panel-surface mx-auto w-[400px] mdm:w-[85%] kdm:w-[90%] h-[500px] rounded-[10px] overflow-hidden bg-bg-sidebar">
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
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="flex w-full mb-[16px]">
                    <input
                      ref={userNameRef}
                      onChange={(e) => setUsernameValue(e.target.value)}
                      value={usernameValue}
                      name="username"
                      placeholder="Số điện thoại"
                      className="p-[16px] h-[48px] text-[14px] text-primary bg-bg-field flex-grow flex-shrink rounded-[8px] outline-none border border-bd-filed-form-color focus:border-[var(--primary-color)] transition-colors"
                      type="text"
                    />
                  </div>
                  <div className="relative flex w-full mb-[16px]">
                    <input
                      name="password"
                      onChange={(e) => setPasswordValue(e.target.value)}
                      value={passwordValue}
                      ref={passwordRef}
                      placeholder="Mật khẩu"
                      className="p-[16px] pr-[42px] h-[48px] text-[14px] text-primary bg-bg-field flex-grow flex-shrink rounded-[8px] outline-none border border-bd-filed-form-color focus:border-[var(--primary-color)] transition-colors"
                      type={isShowPassword ? "text" : "password"}
                    />
                    <div className="absolute top-1/2 right-[4%] flex items-center justify-center translate-y-[-50%]">
                      <Button
                        type="button"
                        onClick={handleTogglePassword}
                        className="text-[22px] !text-items hover:text-primary"
                      >
                        {isShowPassword ? (
                          <FaRegEye className="text-[20px]" />
                        ) : (
                          <FaRegEyeSlash className="text-[20px]" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-primary text-[14px] mb-[24px] cursor-pointer hover:underline">
                    Quên mật khẩu
                  </p>
                  <Button
                    disabled={disabledBtn}
                    className="rounded-[8px] disabled:!bg-bg-disabled h-[48px] w-full text-[16px] hover:text-primary font-semibold"
                    primary
                  >
                    Đăng nhập
                  </Button>
                  <div className="relative flex items-center justify-center my-[8px]">
                    <p className="relative inline-block px-[12px] text-[12px] text-primary font-medium bg-bg-sidebar z-[2]">
                      Or
                    </p>
                    <span className="absolute top-1/2 left-0 h-px w-full bg-bd-filed-form-color translate-y-[-50%] pointer-events-none z-[1]"></span>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleLogin}
                    className="btnLogin bg-bg-field gap-x-[8px] text-[13px] py-[8px] px-[12px] font-medium rounded-[4px] h-[48px] w-full border border-bd-filed-form-color hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    leftIcon={<FcGoogle className="text-[20px]" />}
                  >
                    Đăng nhập bằng Google
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default LoginModal;
