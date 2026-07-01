"use client";

import * as React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useTvShowFilms } from "@/features/film/hooks/use-film-queries";
import { CategoryFilmScreen } from "@/components/film/category-film-screen";

export default function TvShowsPage() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isLoading, isError } = useTvShowFilms(page);

  return (
    <CategoryFilmScreen
      title="TV Shows Đặc Sắc"
      data={data}
      isLoading={isLoading}
      isError={isError}
      page={page}
      onPageChange={(p) => setPage(p, { scroll: true })}
    />
  );
}
