import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import PreviewFilmElement from "../../components/Element/PreviewFilmElement";
import { setShowPreview } from "../../redux/slices/previewInfoFilmSlice";
import { previewFilmSelector } from "../../redux/selectors";

function Container({ children }) {
  const dispatch = useDispatch();

  const previewData = useSelector(previewFilmSelector);
  const { position, isShowPreview, currentPreviewData } = previewData;

  useEffect(() => {
    if (isShowPreview) {
      window.addEventListener("scroll", handleMouseLeave);
    }

    return () => {
      window.addEventListener("scroll", handleMouseLeave);
    };
  }, [isShowPreview]);

  const handleMouseEnter = () => {
    dispatch(setShowPreview(true));
  };

  const handleMouseLeave = () => {
    dispatch(setShowPreview(false));
  };

  const memorizedPreview = useMemo(
    () => (
      <PreviewFilmElement
        data={currentPreviewData}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed w-[275px] z-[100]"
      />
    ),
    [isShowPreview, position, currentPreviewData]
  );

  return (
    <main className="relative h-full min-h-[550px] pt-[80px] mb-[40px]">
      <div className="3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl px-[15px] mx-auto">
        {children}
      </div>
      {isShowPreview && memorizedPreview}
    </main>
  );
}

export default Container;
