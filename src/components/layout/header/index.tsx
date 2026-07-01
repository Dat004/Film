"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { filmService } from "@/features/film/services/film-service";
import LeftHeader from "./left-header";
import RightHeader from "./right-header";

export function Header() {
  const { data } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: filmService.allCategoryService,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  return (
    <header className="fixed left-0 right-0 top-0 h-[80px] bg-bg-layout z-[5000] border-b border-solid border-bd-filed-form-color/10 backdrop-blur-[8px]">
      <div className="flex items-center justify-between p-[15px] mx-auto 3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl ">
        <LeftHeader dataCategory={data} />
        <RightHeader />
      </div>
    </header>
  );
}

export default Header;
