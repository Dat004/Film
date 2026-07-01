"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLargeFill } from "react-icons/ri";

import Button from "@/components/ui/button";
import Modal from "./modal";

interface ContentModalProps {
  content?: React.ReactNode;
  onClose?: () => void;
  isShowModal?: boolean;
}

export function ContentModal({
  content = "",
  onClose = () => {},
  isShowModal = false,
}: ContentModalProps) {
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
            <div className="modal-panel-surface w-[625px] mdm:w-[85%] min-h-[220px] h-[500px] rounded-[10px] mx-auto overflow-hidden bg-bg-sidebar">
              <div className="p-[15px] flex justify-end">
                <Button onClick={onClose} rounded>
                  <RiCloseLargeFill className="text-[18px]" />
                </Button>
              </div>
              <div className="px-[32px] overflow-auto max-h-[calc(100%-72px)]">
                <p className="text-[14px] text-primary leading-[1.5] font-normal">
                  <span className="whitespace-normal">{content}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default ContentModal;
