"use client";

import * as React from "react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import NextImage from "next/image";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import { auth } from "@/lib/firebase";
import Button from "@/components/ui/button";
import { LogoutIcon } from "@/icons";

interface MenuUserProps {
  data?: {
    displayName?: string;
    email?: string;
    [key: string]: any;
  } | null;
  dataMenu?: any[];
  onClose?: () => void;
}

export function MenuUser({ data = {}, dataMenu = [], onClose = () => {} }: MenuUserProps) {
  const displayName = data?.displayName || "User";
  const email = data?.email || "";
  const avatar = useAuthStore((state) => state.avatar);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Đã đăng xuất ra khỏi tài khoản!");
      onClose();
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Không thể đăng xuất. Vui lòng thử lại!");
    }
  };

  return (
    <div className="bg-bg-sidebar rounded-[4px] border border-solid border-bd-filed-form-color shadow-2xl overflow-hidden min-w-[220px]">
      <header className="py-[12px] px-[15px] border-b border-solid border-bd-filed-form-color bg-black/10">
        <div className="flex items-center">
          <div className="relative size-[32px] shrink-0">
            {avatar ? (
              <NextImage
                className="rounded-[50%] object-cover"
                src={avatar}
                alt="avatar"
                fill
                sizes="32px"
              />
            ) : (
              <div className="rounded-[50%] size-full bg-[var(--primary-color)]/20" />
            )}
          </div>
          <div className="text-[14px] text-primary ml-[10px] truncate">
            <p className="font-semibold leading-[1.18] truncate">{displayName}</p>
            <p className="text-[12px] text-secondary leading-[1.18] truncate">{email}</p>
          </div>
        </div>
      </header>
      
      <div className="py-[4px]">
        {dataMenu.map((item) => {
          const { Icon } = item;
          return (
            <Link className="text-primary block" key={item.id} href={item.path} onClick={onClose}>
              <div className="flex p-[12px] px-[15px] hover:bg-bg-multiport items-center transition-colors">
                <i className="block size-[20px] text-secondary shrink-0">
                  <Icon width="100%" height="100%" />
                </i>
                <span className="text-[14px] font-medium ml-[10px]">{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <footer className="border-t border-solid border-bd-filed-form-color">
        <Button
          onClick={handleLogout}
          className="py-[12px] px-[15px] hover:bg-bg-multiport text-[14px] text-primary !justify-start w-full gap-x-[10px] font-normal rounded-none"
          leftIcon={<LogoutIcon />}
        >
          Đăng xuất
        </Button>
      </footer>
    </div>
  );
}

export default MenuUser;
