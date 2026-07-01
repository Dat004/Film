"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/features/auth/stores/auth-store";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { dataUserMenu } from "@/data";
import { ProtectedRoute } from "@/features/auth/components/protected-route";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userInfo = useAuthStore((state) => state.userInfo);
  const avatar = useAuthStore((state) => state.avatar);

  const itemsRef = React.useRef<HTMLDivElement[]>([]);
  const slideRef = React.useRef<HTMLSpanElement | null>(null);

  const handleSetTabIndex = React.useCallback((index: number) => {
    if (itemsRef.current[index] && slideRef.current) {
      const activeEl = itemsRef.current[index];
      const width = activeEl.offsetWidth;
      // Calculate offset relative to parent container clientRect
      const containerLeft = activeEl.parentElement?.parentElement?.getBoundingClientRect().left || 0;
      const left = activeEl.getBoundingClientRect().left - containerLeft;

      slideRef.current.style.width = width - 20 + "px";
      slideRef.current.style.left = left + 10 + "px";
    }
  }, []);

  React.useEffect(() => {
    dataUserMenu.forEach((item, index) => {
      if (pathname === item.path) {
        // Delay slightly for render layouts calculation
        setTimeout(() => handleSetTabIndex(index), 100);
      }
    });
  }, [pathname, handleSetTabIndex]);

  return (
    <ProtectedRoute>
      <div className="w-full">
        <Header />
        <main className="min-h-[520px] pt-[80px] pb-[30px]">
          <section className="relative pt-[40px] mb-[30px] overflow-hidden">
            <div
              style={{ backgroundImage: avatar ? `url(${avatar})` : "none" }}
              className="absolute left-0 right-0 top-[-20px] bottom-[-20px] blur-[20px] opacity-40 bg-center bg-cover bg-no-repeat"
            ></div>
            <div className="relative px-[15px] flex flex-col items-center">
              <h1 className="text-primary text-[30px] text-center mb-[15px] font-medium">
                Hi, {userInfo?.displayName || "User"}
              </h1>
              <div className="relative flex items-center justify-center border-b border-solid border-bd-filed-form-color/25 pb-0">
                <div className="flex">
                  {dataUserMenu.map((item, index) => {
                    const { Icon } = item;
                    const isActive = pathname === item.path;

                    return (
                      <div
                        key={item.id}
                        data-active={isActive ? "true" : "false"}
                        onClick={() => handleSetTabIndex(index)}
                        ref={(ref) => {
                          if (ref) itemsRef.current[index] = ref;
                        }}
                        className="mx-[15px]"
                      >
                        <Link
                          href={item.path}
                          className={`${
                            isActive ? "text-primary font-semibold" : "text-secondary"
                          } hover:text-primary flex items-center py-[15px] px-[10px] leading-[1.25] transition-colors`}
                        >
                          <i className="size-[15px] mdm:size-[20px] flex items-center justify-center">
                            <Icon width="100%" height="100%" />
                          </i>
                          <span className="mdm:hidden text-[14px] ml-[6px] whitespace-nowrap">
                            {item.title}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <span
                  ref={slideRef}
                  className="absolute h-px bg-white bottom-0 transition-all duration-300"
                ></span>
              </div>
            </div>
          </section>
          
          <div className="3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl px-[15px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
