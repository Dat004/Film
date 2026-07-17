import type { Metadata } from 'next';

import { detailsFilmService } from '@/features/film';
import FilmExtrasSection from '@/features/film/components/FilmExtrasSection';
import RelatedFilmsSection from '@/features/film/components/RelatedFilmsSection';
import { Player } from '@/features/player';
import {
  normalizeFilmDetailResponse,
  resolveFilmImageUrl,
  stripHtmlToText,
} from '@/lib/film-detail';

export interface DetailsFilmPageProps {
  params: Promise<{ film: string }>;
}

export async function generateMetadata({ params }: DetailsFilmPageProps): Promise<Metadata> {
  const { film } = await params;

  try {
    const response = await detailsFilmService(film);
    const filmData = normalizeFilmDetailResponse(response.data);
    const movie = filmData?.movie;

    if (!movie) {
      return { title: 'Chi tiết phim' };
    }

    const description = movie.content
      ? stripHtmlToText(movie.content).slice(0, 160)
      : `Xem ${movie.name} online chất lượng cao`;

    const poster = resolveFilmImageUrl(movie.poster_url || movie.thumb_url);

    return {
      title: `${movie.name} | Xem phim online`,
      description,
      openGraph: {
        title: movie.name,
        description,
        ...(poster ? { images: [{ url: poster, alt: movie.name }] } : {}),
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.name,
        description,
        ...(poster ? { images: [poster] } : {}),
      },
    };
  } catch {
    return { title: 'Chi tiết phim' };
  }
}

export default async function DetailsFilmPage({ params }: DetailsFilmPageProps) {
  const { film } = await params;

  try {
    const response = await detailsFilmService(film);
    const filmData = normalizeFilmDetailResponse(response.data);

    if (!filmData?.movie) {
      throw new Error('Invalid film data');
    }

    const categorySlugs =
      filmData.movie.category
        ?.map((cat) => cat.slug)
        .filter((slug): slug is string => Boolean(slug)) ?? [];

    const filmTitle = filmData.movie.name ?? '';

    return (
      <div className="film-detail" data-testid="film-detail">
        <Player data={filmData} />
        <FilmExtrasSection filmSlug={film} filmTitle={filmTitle} movie={filmData.movie} />
        <RelatedFilmsSection filmSlug={film} categorySlugs={categorySlugs} currentSlug={film} />
      </div>
    );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-primary text-center">
        <h3 className="text-xl font-bold mb-2">Đã có lỗi xảy ra</h3>
        <p className="text-[15px] opacity-70">
          Không thể tải thông tin phim. Vui lòng thử lại sau!
        </p>
      </div>
    );
  }
}
