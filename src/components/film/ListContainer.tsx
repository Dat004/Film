"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ref, get, set } from "firebase/database";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { database } from "@/lib/firebase";
import LoginModal from "@/features/auth/components/login-modal";
import Menu from "@/components/ui/menu";
import staticData from "@/data";

interface ListContainerProps {
  className?: string;
  dataFilm?: Record<string, any>;
  xLeft?: boolean;
  xRight?: boolean;
  yTop?: boolean;
  yBottom?: boolean;
  isShow?: boolean;
}

export function ListContainer({
  className,
  dataFilm = {},
  xLeft = false,
  xRight = false,
  yTop = false,
  yBottom = false,
  isShow = false,
}: ListContainerProps) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const uid = useAuthStore((state) => state.uid);
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const listContainerClasses = cn(
    "absolute z-[80] overflow-hidden rounded-[8px] border border-bd-filed-form-color shadow-lg bg-bg-sidebar",
    {
      [className || ""]: className,
      "right-0": xRight,
      "left-0": xLeft,
      "top-[calc(100%+10px)]": yTop,
      "bottom-[calc(100%+10px)]": yBottom,
    }
  );

  const variants = {
    hide: {
      scaleY: 0,
      opacity: 0,
    },
    show: {
      scaleY: 1,
      opacity: 1,
    },
  };

  const handleAddList = async (item: any) => {
    if (isLoggedIn && uid) {
      const type = item?.type;
      const refPath = `list_video/${uid}/${dataFilm?._id}`;
      try {
        const dbRef = ref(database, refPath);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          toast.warning("Video đã có trong danh sách phát!");
        } else {
          await set(dbRef, { ...dataFilm, type });
          toast.success("Đã thêm video vào danh sách phát!");
        }
      } catch (err) {
        console.error("Error adding to list:", err);
        toast.error("Không thể thêm video vào danh sách phát!");
      }
    } else {
      toast.warning("Vui lòng đăng nhập!");
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isShow && (
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            exit="hide"
            layout
            className={listContainerClasses}
            style={{ transformOrigin: yBottom ? "bottom" : "top" }}
          >
            <Menu onClick={handleAddList} dataMenu={{ items: staticData.dataList }} darkMode />
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal isShowModal={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default ListContainer;
