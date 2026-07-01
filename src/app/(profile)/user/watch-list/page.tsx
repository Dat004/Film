"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useWatchList } from "@/features/auth/hooks/use-user-data-queries";
import { dataList } from "@/data/list";
import { HeartIcon } from "@/icons";
import { HiOutlinePlay, HiOutlineTrash } from "react-icons/hi2";
import { ref, remove } from "firebase/database";
import { database } from "@/lib/firebase";
import { toast } from "sonner";

export default function WatchListPage() {
  const uid = useAuthStore((state) => state.uid);
  const { data: watchListGroups = [], isLoading } = useWatchList(uid);
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const handleDelete = async (e: React.MouseEvent, filmId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uid || !filmId) return;

    try {
      const dbRef = ref(database, `list_video/${uid}/${filmId}`);
      await remove(dbRef);
      toast.success("Đã xóa khỏi danh sách phát!");
    } catch (err) {
      console.error("Error removing watchlist item:", err);
      toast.error("Không thể xóa khỏi danh sách phát!");
    }
  };

  // Flatten or filter data based on activeTab
  const displayList = React.useMemo(() => {
    if (activeTab === "all") {
      // Flatten all groups
      return watchListGroups.reduce<any[]>((acc, group) => {
        return [...acc, ...group.data];
      }, []);
    } else {
      // Filter by group title (which matches the type)
      const group = watchListGroups.find((g) => g.title === activeTab);
      return group ? group.data : [];
    }
  }, [watchListGroups, activeTab]);

  const menu = [
    { title: "Tất cả", type: "all" },
    ...dataList.map((item) => ({
      title: item.title === "Watching" ? "Đang xem" :
             item.title === "On-Hold" ? "Tạm dừng" :
             item.title === "Plan to watch" ? "Muốn xem" :
             item.title === "Dropped" ? "Bỏ dở" : "Đã hoàn thành",
      type: item.type
    }))
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 mt-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-bd-filed-form-color/20">
        <i className="text-[var(--primary-color)] size-[28px]">
          <HeartIcon width="100%" height="100%" />
        </i>
        <h1 className="text-primary text-2xl font-bold">Danh Sách Phát</h1>
      </div>

      {/* Playlist category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {menu.map((item) => (
          <button
            key={item.type}
            onClick={() => setActiveTab(item.type)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              activeTab === item.type
                ? "bg-[var(--primary-color)] text-bg-sidebar border-transparent dark:text-black shadow-md font-bold"
                : "border-bd-filed-form-color/40 hover:border-bd-filed-form-color/80 text-secondary hover:text-primary"
            }`}
          >
            {item.title}
          </button>
        ))}
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
      ) : displayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-sidebar/20 rounded-2xl border border-dashed border-bd-filed-form-color/30">
          <div className="size-16 text-secondary mb-4 opacity-50"><HeartIcon width="100%" height="100%" /></div>
          <h3 className="text-lg font-semibold text-primary">Danh sách này chưa có phim</h3>
          <p className="text-sm text-secondary mt-1 mb-6 max-w-sm">
            Hãy thêm phim yêu thích của bạn vào danh sách để quản lý và theo dõi dễ dàng hơn.
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
          {displayList.map((item: any) => (
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
                  title="Xóa khỏi danh sách phát"
                >
                  <HiOutlineTrash className="size-4" />
                </button>

                {/* Category label on card */}
                {activeTab === "all" && item.type && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded-md bg-black/70 backdrop-blur-xs text-[var(--primary-color)] tracking-wider uppercase border border-bd-filed-form-color/20">
                    {item.type === "watching" ? "Đang xem" :
                     item.type === "on-hold" ? "Tạm dừng" :
                     item.type === "plan-to-watch" ? "Muốn xem" :
                     item.type === "dropped" ? "Bỏ dở" : "Hoàn thành"}
                  </span>
                )}
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
                    {item.origin_name || ""} ({item.year || "N/A"})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
