"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useContinueWatching } from "@/features/auth/hooks/use-user-data-queries";
import { HistoryIcon } from "@/icons";
import { HiOutlinePlay, HiOutlineTrash } from "react-icons/hi2";
import { ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";

export default function ContinueWatchingPage() {
  const uid = useAuthStore((state) => state.uid);
  const { data: continueWatchingList = [], isLoading } = useContinueWatching(uid);

  const handleDelete = async (e: React.MouseEvent, filmId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uid || !filmId) return;

    try {
      const dbRef = ref(database, `continue_watching/${uid}/${filmId}`);
      await remove(dbRef);
      toast.success("Đã xóa khỏi lịch sử xem phim!");
    } catch (err) {
      console.error("Error removing continue watching:", err);
      toast.error("Không thể xóa phim khỏi lịch sử xem!");
    }
  };

  const getProgressPercentage = (currentTime: number, duration: number) => {
    if (!duration || duration <= 0) return 0;
    return Math.min(Math.round((currentTime / duration) * 100), 100);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 mt-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-bd-filed-form-color/20">
        <i className="text-[var(--primary-color)] size-[28px]">
          <HistoryIcon width="100%" height="100%" />
        </i>
        <h1 className="text-primary text-2xl font-bold">Lịch Sử Xem Phim</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="bg-bg-sidebar/30 border border-bd-filed-form-color/20 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-bg-field"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-bg-field rounded w-3/4"></div>
                <div className="h-3 bg-bg-field rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : continueWatchingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-sidebar/20 rounded-2xl border border-dashed border-bd-filed-form-color/30">
          <div className="size-16 text-secondary mb-4 opacity-50"><HistoryIcon width="100%" height="100%" /></div>
          <h3 className="text-lg font-semibold text-primary">Bạn chưa xem bộ phim nào gần đây</h3>
          <p className="text-sm text-secondary mt-1 mb-6 max-w-sm">
            Lịch sử xem phim sẽ tự động lưu lại tiến trình xem để bạn có thể tiếp tục bất cứ lúc nào.
          </p>
          <Link
            href="/"
            className="bg-[var(--primary-color)] text-bg-sidebar dark:text-black font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:opacity-90 text-sm"
          >
            Khám phá phim ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {continueWatchingList.map((item) => {
            const watching = item.watching || {};
            const percent = getProgressPercentage(watching.currentTime, watching.duration);

            return (
              <div
                key={item._id}
                className="group relative bg-bg-sidebar/40 border border-bd-filed-form-color/10 hover:border-bd-filed-form-color/30 hover:bg-bg-sidebar/60 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Poster Image */}
                <Link href={`/phim/${item.slug}`} className="relative aspect-[2/3] w-full block overflow-hidden bg-bg-field shrink-0">
                  <Image
                    src={item.thumb_url || item.poster_url || ""}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-w-640px) 50vw, (max-w-768px) 33vw, 25vw"
                    unoptimized
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-3 bg-[var(--primary-color)] text-bg-sidebar dark:text-black rounded-full scale-90 group-hover:scale-100 transition-transform shadow-lg">
                      <HiOutlinePlay className="size-6 fill-current" />
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:shadow-md"
                    title="Xóa lịch sử xem"
                  >
                    <HiOutlineTrash className="size-4" />
                  </button>

                  {/* Progress Bar overlay on bottom of thumbnail */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-1.5 backdrop-blur-xs">
                    <div className="flex justify-between text-[10px] text-white/90 mb-1">
                      <span>{watching.episode_info?.name || "Đang xem"}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary-color)] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-primary truncate" title={item.name}>
                      <Link href={`/phim/${item.slug}`} className="hover:text-[var(--primary-color)]">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-[11px] text-secondary mt-1">
                      Đã xem {formatTime(watching.currentTime)} / {formatTime(watching.duration)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
