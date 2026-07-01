import * as React from "react";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { filmService } from "@/features/film/services/film-service";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "Hoạt Hình | Xem Phim Hoạt Hình Mới Nhất",
  description: "Danh sách hoạt hình mới nhất cập nhật liên tục.",
};

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams?.page || "1", 10);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["films", "cartoon", page, 20],
    queryFn: () => filmService.cartoonService(page, 20),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientPage />
    </HydrationBoundary>
  );
}
