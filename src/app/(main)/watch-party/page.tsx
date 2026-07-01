"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublicRooms } from "@/features/watch-party/services/watch-party-service";
import { RiFilmLine, RiGroupLine, RiArrowRightLine, RiCompass3Line } from "react-icons/ri";
import images from "@/assets/images";
import { toast } from "sonner";

const DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";

export default function WatchPartyLobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRooms = async () => {
      try {
        const publicRooms = await getPublicRooms();
        setRooms(publicRooms);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
        toast.error("Không thể kết nối dịch vụ phòng xem chung!");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const totalViewers = rooms.reduce(
    (acc, r) => acc + (r.members ? Object.keys(r.members).length : 0),
    0
  );

  return (
    <div className="bg-bg-layout text-primary min-h-[80vh] py-10 px-4 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Block with Premium Edge Gradient border */}
        <div className="relative bg-bg-sidebar border border-bd-filed-form-color/40 rounded-2xl p-6 sm:p-8 mb-8 flex justify-between items-center gap-6 flex-wrap shadow-xl overflow-hidden before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[var(--primary-color)]">
          <div className="relative z-10">
            <h1 className="font-bold text-3xl text-primary flex items-center gap-3">
              <RiFilmLine className="text-[var(--primary-color)] shrink-0 size-8" />
              Sảnh Xem Chung
            </h1>
            <p className="text-sm text-secondary mt-2 max-w-2xl">
              Khám phá các phòng chiếu đang phát sóng trực tiếp công khai. Hãy chọn một phòng bất kỳ để thưởng thức và thảo luận phim cùng mọi người!
            </p>
          </div>

          {!loading && rooms.length > 0 && (
            <div className="relative z-10 bg-bg-field border border-bd-filed-form-color/60 rounded-xl p-4 text-sm text-primary shadow-inner">
              Trạng thái sảnh: <b className="text-[var(--primary-color)] font-bold">{rooms.length} phòng</b> · <b className="text-[var(--primary-color)] font-bold">{totalViewers} thành viên</b> đang kết nối
            </div>
          )}
        </div>

        {/* Rooms Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-bg-sidebar/50 border border-bd-filed-form-color/20 rounded-2xl overflow-hidden flex flex-col h-[380px] animate-pulse"
              >
                <div className="aspect-[2/3] bg-bg-field/40 rounded-t-2xl border-b border-bd-filed-form-color/20 shrink-0"></div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="h-3 rounded-full bg-bg-field w-1/3"></div>
                  <div className="h-5 rounded-full bg-bg-field w-3/4"></div>
                  <div className="h-3 rounded-full bg-bg-field w-1/2 mt-auto"></div>
                  <div className="h-10 rounded-xl bg-bg-field w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="max-w-md mx-auto mt-12 text-center bg-bg-sidebar border border-bd-filed-form-color/30 rounded-2xl p-8 shadow-xl">
            <RiCompass3Line className="text-[var(--primary-color)] mx-auto mb-4 size-12 opacity-80" />
            <h3 className="text-xl font-bold text-primary mb-2">Không có phòng xem chung nào</h3>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Hiện tại không có phòng xem chung công khai nào đang mở. Hãy truy cập trang chi tiết bộ phim yêu thích của bạn và chọn nút <strong className="text-[var(--primary-color)]">"Tạo Phòng Xem Chung"</strong> để bắt đầu hành trình chiếu phim đầu tiên nhé!
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-bg-btn-primary hover:bg-hover-btn-primary text-bg-sidebar dark:text-black font-semibold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RiCompass3Line className="size-5" />
              Khám Phá Phim
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map((room) => {
              const roomId = room.roomId || "";
              const membersCount = room.members ? Object.keys(room.members).length : 0;
              const movieName = room.filmData?.movie?.name || "Phim ẩn danh";
              const categoryName = room.filmData?.movie?.category?.[0]?.name;
              const shelfLabel = categoryName ? `${categoryName.toUpperCase()}` : "PHIM MỚI";
              const hostMember = room.members?.[room.hostId] || { displayName: "Ẩn danh", photoURL: "" };

              return (
                <div
                  key={roomId}
                  className="group relative bg-bg-sidebar border border-bd-filed-form-color/30 rounded-2xl overflow-hidden flex flex-col min-h-[420px] shadow-md hover:shadow-2xl hover:-translate-y-1 hover:border-[var(--primary-color)]/50 transition-all duration-300 h-full"
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 z-10 border border-[var(--primary-color)]/40 text-[10px] text-primary bg-bg-sidebar/90 font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-md backdrop-blur-xs select-none">
                    Đang chiếu
                  </div>

                  {/* Thumbnail Poster */}
                  <Link href={`/watch-party/${roomId}`} className="relative aspect-[4/5] w-full block overflow-hidden bg-bg-field shrink-0">
                    <Image
                      src={room?.filmData?.movie?.poster_url || room?.filmData?.movie?.thumb_url || (images.imgLoadingVertical as any)?.src || ""}
                      alt={movieName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, 25vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                  </Link>

                  {/* Description Box */}
                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between bg-bg-sidebar">
                    <div>
                      <span className="text-[10px] text-[var(--primary-color)] font-semibold tracking-wider">{shelfLabel}</span>
                      <h3
                        title={movieName}
                        className="font-bold text-sm leading-snug text-primary line-clamp-2 mt-1 hover:text-[var(--primary-color)] transition-colors"
                      >
                        {movieName}
                      </h3>
                      <div className="text-[10px] text-secondary mt-1 font-mono uppercase">
                        Phòng: <span className="text-primary">#{roomId.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-bd-filed-form-color/30 space-y-4">
                      {/* Host & Viewers Count */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative size-6 rounded-full overflow-hidden shrink-0 border border-bd-filed-form-color">
                            <Image
                              src={hostMember.photoURL || DEFAULT_AVATAR_URL}
                              alt={hostMember.displayName || "Host"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <span className="text-secondary truncate font-medium">
                            {hostMember.displayName || "Ẩn danh"}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-secondary text-[11px] font-semibold bg-bg-field px-2 py-0.5 rounded-md border border-bd-filed-form-color/20 shrink-0">
                          <RiGroupLine className="size-3.5" />
                          {membersCount}/20
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => router.push(`/watch-party/${roomId}`)}
                        className="w-full bg-bg-btn-primary hover:bg-hover-btn-primary text-bg-sidebar dark:text-black font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
                      >
                        Vào Xem Ngay
                        <RiArrowRightLine className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
