"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function SettingPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by mounting client-side first
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="max-w-[700px] mx-auto px-[15px] pb-[40px] animate-pulse">
        <div className="h-8 w-48 bg-slate-700 rounded mb-4"></div>
        <div className="h-4 w-96 bg-slate-700 rounded mb-8"></div>
        <div className="h-32 bg-slate-800 rounded-lg"></div>
      </section>
    );
  }

  return (
    <section className="max-w-[700px] mx-auto px-[15px] pb-[40px]">
      <h1 className="text-primary text-[28px] font-medium mb-[6px]">
        Cài đặt
      </h1>
      <p className="text-title text-[14px] whitespace-normal mb-[18px]">
        Chọn giao diện. Chế độ <span className="text-primary">System</span> sẽ
        tự động theo giao diện hệ điều hành.
      </p>

      <div className="bg-bg-block rounded-[10px] p-[14px]">
        <div className="flex items-center justify-between gap-x-[12px] mb-[10px]">
          <div>
            <p className="text-primary text-[16px] font-medium">Theme</p>
            <p className="text-title text-[13px] whitespace-normal">
              Đang chọn:{" "}
              <span className="text-primary font-medium capitalize">{theme}</span>
              {theme === "system" && (
                <>
                  {" "}
                  (resolved:{" "}
                  <span className="text-primary font-medium capitalize">
                    {resolvedTheme}
                  </span>
                  )
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-[10px] mt-4">
          <Button
            variant="outline"
            onClick={() => setTheme("system")}
            className={`px-[14px] py-[10px] text-[14px] font-normal hover:bg-bg-btn-hover-pagination hover:text-primary transition-all duration-200 ${
              theme === "system" ? "border-bd-active text-primary" : "border-bd-select-menu text-secondary"
            }`}
          >
            System
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("light")}
            className={`px-[14px] py-[10px] text-[14px] font-normal hover:bg-bg-btn-hover-pagination hover:text-primary transition-all duration-200 ${
              theme === "light" ? "border-bd-active text-primary" : "border-bd-select-menu text-secondary"
            }`}
          >
            Light
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("dark")}
            className={`px-[14px] py-[10px] text-[14px] font-normal hover:bg-bg-btn-hover-pagination hover:text-primary transition-all duration-200 ${
              theme === "dark" ? "border-bd-active text-primary" : "border-bd-select-menu text-secondary"
            }`}
          >
            Dark
          </Button>
        </div>
      </div>
    </section>
  );
}
