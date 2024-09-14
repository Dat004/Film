import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

import { UserAuth } from "../../context/AuthContext";
import { useRealtimeDbFirebase } from "../../hooks";
import { ToastMessage } from "../Toastify";
import data from "../../data";
import Container from ".";

function ListContainer({
  className,
  dataFilm = {},
  xLeft = false,
  xRight = false,
  yTop = false,
  yBottom = false,
  isShow = false,
}) {
  const { uid } = UserAuth();
  const { getDb, setDb } = useRealtimeDbFirebase();

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

  const handleAddList = async (type) => {
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
          <Container className="!bg-bg-white min-w-[140px]">
            <ul>
              {data.dataList.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleAddList(item.type)}
                  className="px-[12px] py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer"
                >
                  <span className="text-[12px] text-dark font-medium">
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ListContainer;
