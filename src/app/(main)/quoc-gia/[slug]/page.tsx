import * as React from "react";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { filmService } from "@/features/film/services/film-service";
import ClientPage from "./client";

interface PageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Phim Quốc Gia ${params.slug} | Xem Phim HD`,
    description: `Danh sách ${params.slug.replace(/-/g, ' ')} mới nhất.`,
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const page = parseInt(searchParams?.page || "1", 10);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["films", "country", params.slug, page, 20],
    queryFn: () => filmService.countryFilmService(params.slug, page, 20),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage params={params} />
    </HydrationBoundary>
  );
}
