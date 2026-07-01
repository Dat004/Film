"use client";

import * as React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useSingleFilms } from "@/features/film/hooks/use-film-queries";
import { CategoryFilmScreen } from "@/components/film/category-film-screen";

export default function PhimLePage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isLoading, isError } = useSingleFilms(page);

  return (
    <CategoryFilmScreen
      title="Phim Lẻ Mới Nhất"
      data={data}
      isLoading={isLoading}
      isError={isError}
      page={page}
      onPageChange={(p) => setPage(p, { scroll: true })}
    />
  );
}
