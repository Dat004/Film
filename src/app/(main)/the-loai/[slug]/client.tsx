"use client";

import * as React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useCategoryFilms } from "@/features/film/hooks/use-film-queries";
import { CategoryFilmScreen } from "@/components/film/category-film-screen";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isLoading, isError } = useCategoryFilms(slug, page);

  const title = data?.data?.titlePage || "Danh Sách Phim";

  return (
    <CategoryFilmScreen
      title={title}
      data={data}
      isLoading={isLoading}
      isError={isError}
      page={page}
      onPageChange={(p) => setPage(p, { scroll: true })}
    />
  );
}
