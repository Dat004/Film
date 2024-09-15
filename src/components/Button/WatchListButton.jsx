import { useState, useLayoutEffect, useEffect } from "react";
import { MdOutlineAdd, MdDeleteOutline } from "react-icons/md";
import { useSelector } from "react-redux";

import { videoPlayerSelector } from "../../redux/selectors";
import ListContainer from "../Container/ListContainer";
import { UserAuth } from "../../context/AuthContext";
import { useRealtimeDbFirebase } from "../../hooks";
import Button from ".";

function WatchListButton({
  top = false,
  right = false,
  left = false,
  bottom = false,
}) {
  const [isAlreadyWatchList, setIsAlreadyWatchList] = useState(false);
  const [isShowMenu, setIsShowMenu] = useState(false);

  const { removeDb } = useRealtimeDbFirebase();
  const {
    movie: { movieData },
  } = useSelector(videoPlayerSelector);
  const { list_watching, uid } = UserAuth();

  useLayoutEffect(() => {
    const isAlready = list_watching.some((watch) =>
      watch.data.find((value) => value?._id === movieData?._id)
    );

    setIsAlreadyWatchList(isAlready);
  }, [movieData, list_watching]);

  useEffect(() => {
    if (isShowMenu) window.addEventListener("click", handleToggleMenu);

    return () => {
      window.removeEventListener("click", handleToggleMenu);
    };
  }, [isShowMenu]);

  const handleRemoveVideoToList = async () => {
    const dbRef = `/list_video/${uid}/${movieData?._id}`;

    await removeDb({
      path: dbRef,
      messageSuccess: "Đã xóa video khỏi danh sách phát!",
      messageError: "Không thể xóa video khỏi danh sách phát!"
    });
  };

  const handleToggleMenu = (e) => {
    e.stopPropagation();

    setIsShowMenu((state) => !state);
  };

  return (
    <>
      <Button
        aria-label="add-list-btn"
        aria-haspopup="menu"
        leftIcon={
          !isAlreadyWatchList ? (
            <MdOutlineAdd className="text-[18px]" />
          ) : (
            <MdDeleteOutline className="text-[18px]" />
          )
        }
        className="text-[12px] text-primary !font-medium"
        onClick={
          !isAlreadyWatchList ? handleToggleMenu : handleRemoveVideoToList
        }
        title={
          !isAlreadyWatchList
            ? "Thêm vào danh sách phát"
            : "Xóa khỏi danh sách phát"
        }
      >
        {!isAlreadyWatchList ? "Add to list" : "Remove from list"}
      </Button>
      <ListContainer
        dataFilm={movieData}
        yTop={top}
        yBottom={bottom}
        xLeft={left}
        xRight={right}
        isShow={!isAlreadyWatchList && isShowMenu}
      />
    </>
  );
}

export default WatchListButton;
