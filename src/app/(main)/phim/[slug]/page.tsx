import * as React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { filmService } from "@/features/film/services/film-service";
import PlayerContainer from "@/features/player/components/player-container";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const data = await filmService.detailsFilmService(params.slug);
    if (!data || !data.movie) {
      return { title: "Không tìm thấy phim | FILM" };
    }
    
    return {
      title: `Xem phim ${data.movie.name} (${data.movie.year}) | HD Vietsub`,
      description: data.movie.content?.replace(/<[^>]+>/g, "").slice(0, 160) || "Xem phim cực hay tại FILM",
      openGraph: {
        title: `${data.movie.name} - ${data.movie.origin_name}`,
        description: data.movie.content?.replace(/<[^>]+>/g, "").slice(0, 160) || "Xem phim cực hay tại FILM",
        images: [data.movie.thumb_url, data.movie.poster_url].filter(Boolean),
      }
    };
  } catch (error) {
    return { title: "Phim | FILM" };
  }
}

export default async function FilmDetailPage({ params }: PageProps) {
  try {
    const data = await filmService.detailsFilmService(params.slug);
    
    if (!data || !data.movie) {
      notFound();
    }

    return (
      <div className="film-detail w-full">
        <PlayerContainer data={data} />
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-20 text-secondary">
        Đã xảy ra lỗi khi tải thông tin phim. Vui lòng thử lại sau!
      </div>
    );
  }
}
