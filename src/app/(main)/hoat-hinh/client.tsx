"use client";

import * as React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useCartoonFilms } from "@/features/film/hooks/use-film-queries";
import { CategoryFilmScreen } from "@/components/film/category-film-screen";

export default function CartoonPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isLoading, isError } = useCartoonFilms(page);

  return (
    <CategoryFilmScreen
      title="Phim Hoạt Hình Nổi Bật"
      data={data}
      isLoading={isLoading}
      isError={isError}
      page={page}
      onPageChange={(p) => setPage(p, { scroll: true })}
    />
  );
}
