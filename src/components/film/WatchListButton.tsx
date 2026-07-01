"use client";

import * as React from "react";
import { MdOutlineAdd, MdDeleteOutline } from "react-icons/md";
import { ref, set } from "firebase/database";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useWatchList } from "@/features/auth/hooks/use-user-data-queries";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { database } from "@/lib/firebase";
import ListContainer from "./ListContainer";
import Button from "@/components/ui/button";

interface WatchListButtonProps {
  top?: boolean;
  right?: boolean;
  left?: boolean;
  bottom?: boolean;
}

export function WatchListButton({
  top = false,
  right = false,
  left = false,
  bottom = false,
}: WatchListButtonProps) {
  const [isShowMenu, setIsShowMenu] = React.useState(false);
  const uid = useAuthStore((state) => state.uid);
  const { data: watchListGroups = [] } = useWatchList(uid);
  const movieData = usePlayerStore((state) => state.movieData);

  const isAlreadyWatchList = React.useMemo(() => {
    return watchListGroups.some((group) =>
      group.data.some((item) => item?._id === movieData?._id)
    );
  }, [movieData, watchListGroups]);

  React.useEffect(() => {
    if (!isShowMenu) return;
    const handleCloseMenu = () => setIsShowMenu(false);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, [isShowMenu]);

  const handleRemoveVideoToList = async () => {
    if (!uid || !movieData?._id) return;
    const dbRef = ref(database, `list_video/${uid}/${movieData._id}`);
    try {
      await set(dbRef, null);
      toast.success("Đã xóa video khỏi danh sách phát!");
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      toast.error("Không thể xóa video khỏi danh sách phát!");
    }
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
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
