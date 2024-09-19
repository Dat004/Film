import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

import { UserAuth } from "../../context/AuthContext";
import { useRealtimeDbFirebase } from "../../hooks";
import { useControlModal } from "../../hooks";
import LoginModal from "../Modal/LoginModal";
import { ToastMessage } from "../Toastify";
import data from "../../data";
import Menu from "../Menu";

function ListContainer({
  className,
  dataFilm = {},
  xLeft = false,
  xRight = false,
  yTop = false,
  yBottom = false,
  isShow = false,
}) {
  const { uid, lg } = UserAuth();
  const { getDb, setDb } = useRealtimeDbFirebase();
  const { handleCloseModal, handleShowModal, isShowModal } = useControlModal();

  const listContainerClasses = classNames("absolute z-[10] overflow-hidden  ", {
    [className]: className,
    "right-0": xRight,
    "left-0": xLeft,
    "top-[calc(100%+10px)]": yTop,
    "bottom-[calc(100%+10px)]": yBottom,
  });

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

  const handleAddList = async (item) => {
    if (lg && uid) {
      const type = item?.type;
      const refPath = `/list_video/${uid}/${dataFilm?._id}`;
      await getDb({
        path: refPath,
        callback: async (snapShot) => {
          if (snapShot?.exists()) {
            ToastMessage.warning("Video đã có trong danh sách phát!");
          } else {
            await setDb({
              path: refPath,
              options: { ...dataFilm, type },
              messageSuccess: "Đã thêm video vào danh sách phát!",
              messageError: "Không thể thêm video vào danh sách phát!",
            });
          }
        },
        fallback: (err) => {
          console.log(err);
        },
      });
    } else {
      ToastMessage.warning("Vui lòng đăng nhập!");

      handleShowModal();
    }
  };

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          variants={variants}
          initial="hide"
          animate="show"
          exit="hide"
          layout
          className={listContainerClasses}
        >
          <Menu onClick={handleAddList} dataMenu={{ items: data.dataList }} />
          <LoginModal isShowModal={isShowModal} onClose={handleCloseModal} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ListContainer;
