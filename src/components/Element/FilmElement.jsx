import { forwardRef, useRef, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setShowPreview,
  setPosition,
  setListPreviewData,
  setCurrentPreviewData,
} from "../../redux/slices/previewInfoFilmSlice";
import { previewFilmSelector } from "../../redux/selectors";
import images from "../../assets/images";
import services from "../../services";

const FilmElement = forwardRef(({ data = {}, baseUrl = "" }, ref) => {
  const mouseEnterTimeoutRef = useRef(null);

  const { listPreviewData } = useSelector(previewFilmSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (mouseEnterTimeoutRef.current) {
        clearTimeout(mouseEnterTimeoutRef.current);
      }
      
      dispatch(setShowPreview(false));
    };
  }, []);

  const imageUrl = baseUrl
    ? `${baseUrl}/${data?.poster_url || data?.thumb_url}`
    : data?.poster_url || data?.thumb_url;

  const handleGetPosition = (e) => {
    const rect = e.target.getBoundingClientRect();
    const left = rect.left + rect.width / 2;
    const top = rect.top + rect.height / 2;

    dispatch(setPosition({ x: left, y: top }));
  };

  const getPreviewDataFilm = async (slug) => {
    const data = await services.detailsFilmService(slug);

    if (typeof data.data === "object") {
      dispatch(setCurrentPreviewData({ ...data.data.movie }));
      dispatch(setListPreviewData(data.data.movie));
    }
  };

  const handleMouseEnter = (e, id, slug) => {
    handleGetPosition(e);

    const hasMatchingPreview = listPreviewData.some((item) => item._id === id);
    const matchingPreviewData = listPreviewData.find((item) => item._id === id);

    if (mouseEnterTimeoutRef.current) {
      clearTimeout(mouseEnterTimeoutRef.current);
    }
    if (hasMatchingPreview) {
      dispatch(setShowPreview(true));
      dispatch(setCurrentPreviewData(matchingPreviewData));

      return;
    }

    mouseEnterTimeoutRef.current = setTimeout(() => {
      dispatch(setShowPreview(true));
      dispatch(setCurrentPreviewData({}));

      getPreviewDataFilm(slug);
    }, [1000]);
  };

  const handleMouseLeave = () => {
    if (mouseEnterTimeoutRef.current) {
      clearTimeout(mouseEnterTimeoutRef.current);
    }

    dispatch(setShowPreview(false));
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onMouseEnter={(e) => handleMouseEnter(e, data?._id, data?.slug)}
        onMouseLeave={(e) => handleMouseLeave(e)}
        className="relative w-[100%] h-full"
      >
        <Link to={`/phim/${data?.slug}`} aria-label={data?.slug}>
          <div className="pb-[150%] h-0 leading-0">
            <div className="absolute inset-0 rounded-[5px] overflow-hidden">
              <LazyLoadImage
                placeholderSrc={images.imgLoadingVertical}
                className="block h-full object-cover hover:scale-[1.15] transition-transform duration-[350ms] will-change-contents rounded-[5px]"
                alt={data?.name}
                src={imageUrl}
                height="100%"
                width="100%"
                effect="opacity"
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
});

export default FilmElement;
