"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLargeFill } from "react-icons/ri";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

import Button from "@/components/ui/button";
import Modal from "./modal";

interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "primary" | "danger" | "warning";
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmModal({
  isOpen = false,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "primary",
  onConfirm = () => {},
  onCancel = () => {},
}: ConfirmModalProps) {
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

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white shadow-md";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md";
      case "primary":
      default:
        return "bg-[var(--primary-color)] text-bg-sidebar dark:text-black hover:opacity-90 shadow-md";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal onClose={onCancel}>
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            transition={{ duration: 0.2 }}
            exit="hide"
          >
            <div className="modal-panel-surface mx-auto w-[400px] mdm:w-[85%] kdm:w-[90%] rounded-[12px] overflow-hidden bg-bg-sidebar border border-bd-filed-form-color p-[24px]">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-[16.5px] font-bold text-primary flex items-center gap-2">
                  {type === "danger" && (
                    <HiOutlineExclamationTriangle className="text-[20px] text-red-500 shrink-0" />
                  )}
                  {type === "warning" && (
                    <HiOutlineExclamationTriangle className="text-[20px] text-yellow-500 shrink-0" />
                  )}
                  {title}
                </h3>
                <Button onClick={onCancel} rounded className="!p-2 hover:bg-black/5 dark:hover:bg-white/10">
                  <RiCloseLargeFill className="text-[16px] text-secondary" />
                </Button>
              </div>

              <div className="mb-[20px]">
                <p className="text-secondary text-[13.5px] leading-relaxed whitespace-pre-line">
                  {message}
                </p>
              </div>

              <div className="flex gap-[12px] justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 h-[38px] rounded-[8px] border border-bd-filed-form-color text-primary font-semibold text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`px-5 h-[38px] rounded-[8px] font-semibold text-[13px] transition-all ${getConfirmButtonClass()}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
