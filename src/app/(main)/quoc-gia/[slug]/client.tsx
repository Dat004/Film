"use client";

import * as React from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useCountryFilms } from "@/features/film/hooks/use-film-queries";
import { CategoryFilmScreen } from "@/components/film/category-film-screen";

interface CountryPageProps {
  params: {
    slug: string;
  };
}

export default function CountryPage({ params }: CountryPageProps) {
  const { slug } = params;
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const { data, isLoading, isError } = useCountryFilms(slug, page);

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
