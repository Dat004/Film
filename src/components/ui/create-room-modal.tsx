"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";
import { HiOutlineLockClosed } from "react-icons/hi2";

import Button from "@/components/ui/button";
import Modal from "./modal";

interface CreateRoomModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (password: string) => void;
  isCreating?: boolean;
}

export function CreateRoomModal({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  isCreating = false,
}: CreateRoomModalProps) {
  const [password, setPassword] = React.useState("");
  const [isShowPassword, setIsShowPassword] = React.useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onClose}>
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            transition={{ duration: 0.2 }}
            exit="hide"
          >
            <div className="modal-panel-surface mx-auto w-[420px] mdm:w-[85%] kdm:w-[90%] rounded-[12px] overflow-hidden bg-bg-sidebar border border-bd-filed-form-color p-[24px]">
              <div className="flex justify-between items-center mb-[20px]">
                <h3 className="text-[18px] font-bold text-primary flex items-center gap-2">
                  <HiOutlineLockClosed className="text-[20px] text-[var(--primary-color)]" />
                  Cài Đặt Phòng Xem Chung
                </h3>
                <Button onClick={onClose} rounded className="!p-2 hover:bg-black/5 dark:hover:bg-white/10">
                  <RiCloseLargeFill className="text-[16px] text-secondary" />
                </Button>
              </div>

              <form onSubmit={handleSubmit}>
                <p className="text-secondary whitespace-pre-line text-[13.5px] mb-[16px]">
                  Đặt mật khẩu nếu bạn muốn tạo phòng riêng tư. Bạn bè sẽ cần nhập mật khẩu này để tham gia. <strong className="text-primary font-medium">Để trống nếu muốn tạo phòng công khai.</strong>
                </p>

                <div className="relative flex w-full mb-[20px]">
                  <input
                    name="roomPassword"
                    placeholder="Mật khẩu phòng (không bắt buộc)..."
                    className="p-[14px] pr-[42px] h-[46px] text-[14px] text-primary bg-bg-field border border-bd-filed-form-color focus:border-[var(--primary-color)] rounded-[8px] w-full outline-none transition-colors"
                    type={isShowPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isCreating}
                    autoComplete="new-password"
                  />
                  <div className="absolute top-1/2 right-[12px] flex items-center justify-center -translate-y-1/2">
                    <Button
                      type="button"
                      onClick={handleTogglePassword}
                      className="!p-1 text-[18px] !text-items hover:text-primary"
                    >
                      {isShowPassword ? (
                        <FaRegEye className="text-[18px]" />
                      ) : (
                        <FaRegEyeSlash className="text-[18px]" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-[12px]">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isCreating}
                    className="flex-1 h-[44px] rounded-[8px] border border-bd-filed-form-color text-primary font-medium text-[14px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 h-[44px] rounded-[8px] bg-[#e50914] text-white font-medium text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
                  >
                    {isCreating ? "Đang tạo..." : "Tạo Phòng"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default CreateRoomModal;
