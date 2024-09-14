import { useEffect, useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { HelmetProvider } from "react-helmet-async";

import { setShowPreview } from "./redux/slices/previewInfoFilmSlice";
import { CustomToastContainer } from "./components/Toastify";
import { PreviewFilmElement } from "./components/Element";
import { previewFilmSelector } from "./redux/selectors";
import Button from "./components/Button";
import { BackToTopIcon } from "./icons";
import configs from "./configs";

function App() {
  const [isShowBtnBackToTop, setIsShowBtnBackToTop] = useState(false);
  const dispatch = useDispatch();

  const { position, isShowPreview, currentPreviewData } =
    useSelector(previewFilmSelector);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = () => {
    if (window.scrollY >= 20) {
      setIsShowBtnBackToTop(true);

      return;
    }

    setIsShowBtnBackToTop(false);
  };

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

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <HelmetProvider>
      <div className="bg-bg-layout">
        <Router>
          <Routes>
            {configs.routerConfig.map((items) => (
              <Route
                key={items.id}
                path={items.path}
                element={
                  <items.layout>
                    <items.component />
                  </items.layout>
                }
              />
            ))}
          </Routes>
          {isShowPreview && memorizedPreview}
        </Router>
        {isShowBtnBackToTop && (
          <div className="fixed right-[11.5%] bottom-[5%] z-[400]">
            <Button onClick={handleScrollToTop}>
              <BackToTopIcon />
            </Button>
          </div>
        )}
        <CustomToastContainer />
      </div>
    </HelmetProvider>
  );
}

export default App;
