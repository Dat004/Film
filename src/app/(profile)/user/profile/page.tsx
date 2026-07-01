"use client";

import * as React from "react";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineCalendar } from "react-icons/hi";

export default function UserProfilePage() {
  const userInfo = useAuthStore((state) => state.userInfo);

  return (
    <div className="w-full max-w-[800px] mx-auto bg-bg-sidebar/50 backdrop-blur-md border border-bd-filed-form-color/30 rounded-2xl p-6 sm:p-8 shadow-xl mt-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-6 border-b border-bd-filed-form-color/20">
        <div className="relative size-[100px] sm:size-[120px] rounded-full overflow-hidden border-2 border-[var(--primary-color)]/50 shrink-0 shadow-lg bg-bg-field flex items-center justify-center">
          {userInfo?.photoUrl ? (
            <Image
              src={userInfo.photoUrl}
              alt={userInfo.displayName || "User Avatar"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <HiOutlineUser className="size-16 text-secondary" />
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left py-2">
          <h2 className="text-2xl font-bold text-primary mb-1">
            {userInfo?.displayName || "Tài khoản khách"}
          </h2>
          <p className="text-sm text-hover font-medium tracking-wide uppercase mb-3">
            Thành viên xem phim
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-secondary">
            <HiOutlineCalendar className="size-4" />
            <span>Đã đồng bộ tài khoản Firebase</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-field/40 border border-bd-filed-form-color/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-bg-field/60">
          <div className="size-10 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg flex items-center justify-center shrink-0">
            <HiOutlineUser className="size-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Họ và tên</p>
            <p className="text-sm font-semibold text-primary mt-0.5">
              {userInfo?.displayName || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="bg-bg-field/40 border border-bd-filed-form-color/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-bg-field/60">
          <div className="size-10 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg flex items-center justify-center shrink-0">
            <HiOutlineMail className="size-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Địa chỉ Email</p>
            <p className="text-sm font-semibold text-primary mt-0.5 break-all">
              {userInfo?.email || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="bg-bg-field/40 border border-bd-filed-form-color/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-bg-field/60">
          <div className="size-10 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg flex items-center justify-center shrink-0">
            <HiOutlinePhone className="size-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Số điện thoại</p>
            <p className="text-sm font-semibold text-primary mt-0.5">
              {userInfo?.phoneNumber || "Chưa cập nhật"}
            </p>
          </div>
        </div>

        <div className="bg-bg-field/40 border border-bd-filed-form-color/20 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-bg-field/60">
          <div className="size-10 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg flex items-center justify-center shrink-0">
            <HiOutlineUser className="size-5" />
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">User ID (UID)</p>
            <p className="text-xs font-mono text-primary mt-0.5 truncate select-all" title={userInfo?.uid}>
              {userInfo?.uid || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
