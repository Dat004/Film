"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiGroupLine } from "react-icons/ri";
import { toast } from "sonner";

import Paragraph from "@/components/ui/paragraph";
import CreateRoomModal from "@/components/ui/create-room-modal";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { createRoom } from "@/features/watch-party/services/watch-party-service";

// ==========================================
// InfoDisplay Subcomponent (Inline helper)
// ==========================================
interface InfoItem {
  key: string;
  value: any;
}

interface InfoDisplayProps {
  data?: InfoItem[];
}

function InfoDisplay({ data = [] }: InfoDisplayProps) {
  const typeFilm = {
    typeSingle: "single",
    typeSeries: "series",
    typeCartoon: "hoathinh",
    typeTvShow: "tvshows",
  };

  const typeStatus = {
    typeCompleted: "completed",
    typeOnGoing: "ongoing",
  };

  const dataDisplay = {
    typeFilmDisplay: {
      singleDisplay: "Phim lẻ",
      seriesDisplay: "Phim bộ",
      cartoonDisplay: "Phim hoạt hình",
      tvShowsDisplay: "TV shows",
    },
    statusFilm: {
      completedDisplay: "Hoàn thành",
      onGoingDisplay: "Đang phát hành",
    },
  };

  return (
    <div className="detail-film-meta-col divide-y divide-bd-filed-form-color">
      {data.map((item, index) => (
        <p
          key={index}
          className="flex flex-col gap-[2px] py-[12px] text-[13px] leading-[1.45] sm:flex-row sm:items-baseline sm:gap-[10px] sm:py-[10px]"
        >
          <span className="shrink-0 text-[12px] font-medium text-title sm:min-w-[120px]">
            {item.key}:
          </span>
          <span className="min-w-0 text-primary whitespace-pre-wrap">
            {(item.value === typeFilm.typeSingle &&
              dataDisplay.typeFilmDisplay.singleDisplay) ||
              (item.value === typeFilm.typeSeries &&
                dataDisplay.typeFilmDisplay.seriesDisplay) ||
              (item.value === typeFilm.typeCartoon &&
                dataDisplay.typeFilmDisplay.cartoonDisplay) ||
              (item.value === typeFilm.typeTvShow &&
                dataDisplay.typeFilmDisplay.tvShowsDisplay) ||
              (item.value === typeStatus.typeCompleted &&
                dataDisplay.statusFilm.completedDisplay) ||
              (item.value === typeStatus.typeOnGoing &&
                dataDisplay.statusFilm.onGoingDisplay) ||
              item.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ==========================================
// Main DetailFilmPlayer Component
// ==========================================
interface DetailFilmPlayerProps {
  dataMovie?: Record<string, any>;
  data?: Record<string, any>;
  isWatchParty?: boolean;
}

export function DetailFilmPlayer({
  dataMovie = {},
  data = {},
  isWatchParty = false,
}: DetailFilmPlayerProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.userInfo);
  const uid = useAuthStore((state) => state.uid);

  const [isCreatingRoom, setIsCreatingRoom] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const handleOpenCreateModal = () => {
    if (!isLoggedIn || !user || !uid) {
      toast.warning("Vui lòng đăng nhập để tạo phòng!");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateWatchParty = async (passwordInput: string) => {
    setIsCreatingRoom(true);
    try {
      const host = {
        uid,
        displayName: user?.displayName || "Ẩn danh",
        photoURL: user?.photoUrl || "",
      };
      const roomId = await createRoom(
        host,
        dataMovie?.slug || "sample",
        data,
        passwordInput?.trim() || null
      );
      toast.success("Tạo phòng xem chung thành công!");
      setIsCreateModalOpen(false);
      router.push(`/watch-party/${roomId}`);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi mạng! Tạo phòng không thành công");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const {
    poster_url,
    name,
    content,
    origin_name,
    country,
    category,
    type,
    status,
    year,
    lang,
    quality,
    episode_total,
    time,
    episode_current,
  } = dataMovie;

  const infoPrimary = [
    { key: "Tên gốc", value: origin_name },
    {
      key: "Thể loại",
      value: category?.map((item: any) => item?.name)?.join(", "),
    },
    {
      key: "Quốc gia",
      value: country?.map((item: any) => item?.name)?.join(", "),
    },
    { key: "Loại phim", value: type },
    { key: "Trạng thái", value: status },
    { key: "Năm phát hành", value: year },
  ];

  const infoSecondary = [
    { key: "Phụ đề", value: lang },
    { key: "Chất lượng", value: quality },
    { key: "Tổng số tập", value: episode_total },
    { key: "Thời lượng phim", value: time },
    { key: "Tập phim hiện tại", value: episode_current },
  ];

  return (
    <div className="relative detail-film-panel w-full">
      <div className="flex flex-col items-center gap-[18px] mdm:gap-[20px] detail769:flex-row detail769:items-start detail769:gap-[24px]">
        <div className="flex w-full shrink-0 justify-center detail769:w-auto detail769:justify-start">
          <div className="detail-film-poster relative w-[100px] pb-[148%] rounded-[8px] overflow-hidden ring-1 ring-[rgba(15,23,42,0.1)]">
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${poster_url})`,
              }}
            ></div>
          </div>
        </div>
        <div className="w-full min-w-0 space-y-[12px] detail769:flex-1">
          <h2 className="line-clamp-2 w-full text-center uppercase text-[22px] xlm:text-[20px] mdm:text-[18px] leading-[1.25] text-primary font-semibold tracking-tight detail769:text-left">
            {name}
          </h2>
          <p className="flex flex-wrap items-center justify-center gap-x-[8px] gap-y-[4px] text-[13px] text-secondary detail769:justify-start">
            <span>{year}</span>
            <span className="text-title opacity-50">·</span>
            <span>{episode_total} tập</span>
            <span className="text-title opacity-50">·</span>
            <span className="uppercase">{quality}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-[6px] detail769:justify-start">
            <span
              aria-label={lang}
              className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary"
            >
              {lang}
            </span>
            {country?.map((items: any, index: number) => (
              <Link
                key={index}
                aria-label={items?.name}
                href={`/quoc-gia/${items?.slug}`}
                className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary hover:text-hover transition-colors"
              >
                {items?.name}
              </Link>
            ))}
            {category?.map((items: any, index: number) => (
              <Link
                key={index}
                aria-label={items?.name}
                href={`/the-loai/${items?.slug}`}
                className="inline-flex items-center rounded-full bg-bg-block px-[10px] py-[4px] text-[12px] font-medium text-primary hover:text-hover transition-colors"
              >
                {items?.name}
              </Link>
            ))}
          </div>

          {!isWatchParty && (
            <div className="pt-2 flex justify-center detail769:justify-start">
              <button
                type="button"
                disabled={isCreatingRoom}
                onClick={handleOpenCreateModal}
                className="inline-flex items-center justify-center rounded-[8px] bg-[#e50914] px-[18px] py-[10px] text-[14px] font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none hover:opacity-90 shadow-md"
              >
                <RiGroupLine className="text-[18px] mr-2 shrink-0" />
                {isCreatingRoom ? "Đang tạo..." : "Tạo Phòng Xem Chung"}
              </button>
            </div>
          )}

          <Paragraph lineClamp={3} className="text-[14px] font-normal !text-secondary leading-relaxed">
            {content ? content.replace(/&quot;/g, '"') : "Đang cập nhật"}
          </Paragraph>
        </div>
      </div>

      <div className="detail-film-meta-section mt-[22px] pt-[22px] border-t border-solid border-bd-filed-form-color">
        <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-x-[28px] gap-y-0">
          <InfoDisplay data={infoPrimary} />
          <InfoDisplay data={infoSecondary} />
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWatchParty}
        isCreating={isCreatingRoom}
      />
    </div>
  );
}

export default DetailFilmPlayer;

