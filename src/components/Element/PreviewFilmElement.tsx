import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";
import { CgMathPlus } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { cn } from "@/lib/utils";

import { usePreviewStore } from "@/features/watch-party/stores/preview-store";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useWatchList } from "@/features/auth/hooks/use-user-data-queries";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";
import ListContainer from "../film/ListContainer";
import Button from "@/components/ui/button";

interface PreviewFilmElementProps {
  className?: string;
  data?: Record<string, any>;
  [key: string]: any;
}

export const PreviewFilmElement = React.memo(
  function PreviewFilmElement({ className, data = {}, ...props }: PreviewFilmElementProps) {
    const router = useRouter();
    const previewRef = React.useRef<HTMLDivElement | null>(null);

    const { uid } = useAuthStore();
    const { data: watchListGroups = [] } = useWatchList(uid);
    const [isShowMenu, setIsShowMenu] = React.useState(false);

    const position = usePreviewStore((state) => state.position);
    const { x, y } = position;

    const isAlreadyWatchList = React.useMemo(() => {
      return watchListGroups.some((group: any) =>
        group.data.some((item: any) => item?._id === data?._id)
      );
    }, [data, watchListGroups]);

    React.useEffect(() => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();

      const l =
        rect.left + rect.width >= window.innerWidth
          ? rect.left - rect.width
          : rect.left;
      const t =
        rect.top + rect.height >= window.innerHeight
          ? rect.top - rect.height
          : rect.top;

      previewRef.current.style.left = l + "px";
      previewRef.current.style.top = t + "px";
    }, [data]);

    const handleToggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsShowMenu((state) => !state);
    };

    React.useEffect(() => {
      const handleWindowClick = (e: MouseEvent) => {
        setIsShowMenu(false);
      };

      if (isShowMenu) {
        window.addEventListener("click", handleWindowClick);
      }

      return () => {
        window.removeEventListener("click", handleWindowClick);
      };
    }, [isShowMenu]);

    const previewClasses = cn(
      "preview-film-card !bg-[var(--bg-preview-glass)] !rounded-[8px] backdrop-blur-[10px] border border-solid border-[var(--preview-border)] shadow-[var(--preview-shadow)]",
      {
        [className || ""]: className,
      }
    );

    const handleDirectionPage = () => {
      router.push(`/phim/${data?.slug}`);
    };

    const handleRemoveVideoToList = async () => {
      if (!uid || !data?._id) return;
      const dbRef = ref(database, `list_video/${uid}/${data._id}`);
      try {
        await set(dbRef, null);
        toast.success("Đã xóa video khỏi danh sách phát!");
      } catch (err) {
        console.error("Error removing from watchlist:", err);
        toast.error("Không thể xóa video khỏi danh sách phát!");
      }
    };

    return (
      <div
        ref={previewRef}
        className={previewClasses}
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div onClick={(e) => handleToggleMenu(e)} className="p-[15px]">
          {!Object.keys(data).length ? (
            <div className="flex gap-y-[40px] items-center justify-center">
              <div style={{ width: "25px" }} className="loader"></div>
            </div>
          ) : (
            <>
              <header className="mb-[15px]">
                <h3 className="text-[16px] text-primary font-semibold">
                  {data?.name}
                </h3>
              </header>
              <p className="line-clamp-4 text-[13px] leading-[1.25] text-title whitespace-normal mb-[15px]">
                {data?.content}
              </p>
              {data?.origin_name && (
                <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                  Tên gốc:
                  <span className="text-primary ml-[4px] whitespace-normal">
                    {data?.origin_name}
                  </span>
                </p>
              )}
              {data?.year && (
                <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                  Năm:
                  <span className="text-primary ml-[4px] whitespace-normal">
                    {data?.year}
                  </span>
                </p>
              )}
              {data?.status && (
                <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                  Trạng thái:
                  <span className="text-primary ml-[4px] whitespace-normal">
                    {data?.status === "ongoing"
                      ? "Đang phát hành"
                      : data?.status === "completed"
                      ? "Đã hoàn thành"
                      : "Đang cập nhật"}
                  </span>
                </p>
              )}
              {!!data?.category?.length && (
                <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                  Thể loại:
                  {data?.category?.map((item: any, index: number) => (
                    <React.Fragment key={index}>
                      <Link
                        href={`/the-loai/${item.slug}`}
                        className="text-primary ml-[4px] whitespace-normal hover:underline"
                      >
                        {item?.name}
                      </Link>
                      {index < data?.category?.length - 1 && <span>,</span>}
                    </React.Fragment>
                  ))}
                </p>
              )}
              <div className="flex gap-y-[40px] mt-[20px]">
                <div className="relative flex-grow flex-shrink">
                  <Button
                    className="bg-[var(--bg-accent-pink)] w-full gap-x-[8px] py-[8px] rounded-[999px] text-[14px] font-semibold !text-dark"
                    onClick={handleDirectionPage}
                    leftIcon={<FaPlay />}
                  >
                    Watch now
                  </Button>
                </div>
                <div className="relative flex-grow-0 flex-shrink-0 ml-[10px]">
                  <Button
                    rounded
                    onClick={(e) => {
                      if (!isAlreadyWatchList) {
                        handleToggleMenu(e);
                      } else {
                        handleRemoveVideoToList();
                      }
                    }}
                    title={
                      !isAlreadyWatchList
                        ? "Thêm vào danh sách phát"
                        : "Xóa khỏi danh sách phát"
                    }
                    className="bg-bg-white p-[7px] !text-dark"
                  >
                    <i className="text-[23px] flex items-center justify-center">
                      {!isAlreadyWatchList ? <CgMathPlus /> : <MdDeleteOutline />}
                    </i>
                  </Button>
                  <ListContainer
                    dataFilm={data}
                    xRight
                    yBottom
                    isShow={isShowMenu && !isAlreadyWatchList}
                    className=""
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.data?._id === nextProps.data?._id &&
    prevProps.className === nextProps.className
);

export default PreviewFilmElement;
