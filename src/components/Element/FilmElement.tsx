import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePreviewStore } from "@/features/watch-party/stores/preview-store";
import { useQueryClient } from "@tanstack/react-query";
import { filmService } from "@/features/film/services/film-service";
import images from "@/assets/images";

interface FilmItem {
  _id: string;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
}

interface FilmElementProps {
  data: FilmItem;
  baseUrl?: string;
}

export const FilmElement = React.memo(
  React.forwardRef<HTMLDivElement, FilmElementProps>(
    ({ data, baseUrl = "" }, ref) => {
      const mouseEnterTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
      const queryClient = useQueryClient();

      const listPreviewData = usePreviewStore((state) => state.listPreviewData);
      const setShowPreview = usePreviewStore((state) => state.setShowPreview);
      const setPosition = usePreviewStore((state) => state.setPosition);
      const setCurrentPreviewData = usePreviewStore((state) => state.setCurrentPreviewData);
      const setListPreviewData = usePreviewStore((state) => state.setListPreviewData);

      React.useEffect(() => {
        return () => {
          if (mouseEnterTimeoutRef.current) {
            clearTimeout(mouseEnterTimeoutRef.current);
          }
          setShowPreview(false);
        };
      }, [setShowPreview]);

      const imageUrl = baseUrl
        ? `${baseUrl}/${data?.poster_url || data?.thumb_url}`
        : data?.poster_url || data?.thumb_url;

      const handleGetPosition = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const left = rect.left + rect.width / 2;
        const top = rect.top + rect.height / 2;

        setPosition({ x: left, y: top });
      };

      const getPreviewDataFilm = async (slug: string) => {
        try {
          // Prefetch the data for fast navigation
          await queryClient.prefetchQuery({
            queryKey: ["film", slug],
            queryFn: () => filmService.detailsFilmService(slug)
          });
          
          const res = queryClient.getQueryData(["film", slug]) as any;
          if (res && typeof res === "object" && res.movie) {
            setCurrentPreviewData({ ...res.movie });
            setListPreviewData(res.movie);
          }
        } catch (err) {
          console.error("Lỗi khi fetch dữ liệu preview film:", err);
        }
      };

      const handleMouseEnter = (e: React.MouseEvent, id: string, slug: string) => {
        handleGetPosition(e);

        const hasMatchingPreview = listPreviewData.some((item) => item._id === id);
        const matchingPreviewData = listPreviewData.find((item) => item._id === id);

        if (mouseEnterTimeoutRef.current) {
          clearTimeout(mouseEnterTimeoutRef.current);
        }
        
        if (hasMatchingPreview) {
          setShowPreview(true);
          setCurrentPreviewData(matchingPreviewData);
          return;
        }

        mouseEnterTimeoutRef.current = setTimeout(() => {
          setShowPreview(true);
          setCurrentPreviewData({});
          getPreviewDataFilm(slug);
        }, 700);
      };

      const handleMouseLeave = () => {
        if (mouseEnterTimeoutRef.current) {
          clearTimeout(mouseEnterTimeoutRef.current);
        }
        setShowPreview(false);
      };

      return (
        <div className="relative">
          <div
            ref={ref}
            onMouseEnter={(e) => handleMouseEnter(e, data?._id, data?.slug)}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full"
          >
            <Link href={`/phim/${data?.slug}`} aria-label={data?.slug}>
              <div className="pb-[150%] h-0 leading-none">
                <div className="absolute inset-0 rounded-[5px] overflow-hidden">
                  <Image
                    className="block h-full w-full object-cover hover:scale-[1.15] transition-transform duration-[350ms] will-change-transform rounded-[5px]"
                    alt={data?.name || "Film poster"}
                    src={imageUrl || (images.imgLoadingVertical as any)?.src || images.imgLoadingVertical}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
              </div>
            </Link>
          </div>
          <div className="mt-[20px]">
            <h3 className="text-primary line-clamp-2 text-[16px] font-normal">
              {data?.name}
            </h3>
          </div>
        </div>
      );
    }
  ),
  (prevProps, nextProps) =>
    prevProps.data?._id === nextProps.data?._id &&
    prevProps.baseUrl === nextProps.baseUrl
);

FilmElement.displayName = "FilmElement";
export default FilmElement;
