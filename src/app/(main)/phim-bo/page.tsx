import * as React from "react";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { filmService } from "@/features/film/services/film-service";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "Phim Bộ | Xem Phim Phim Bộ Mới Nhất",
  description: "Danh sách phim bộ mới nhất cập nhật liên tục.",
};

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams?.page || "1", 10);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["films", "series", page, 20],
    queryFn: () => filmService.seriesFilmService(page, 20),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage />
    </HydrationBoundary>
  );
}
