import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Button from "./components/Button";
import { BackToTopIcon } from "./icons";
import configs from "./configs";

function App() {
  const [isShowBtnBackToTop, setIsShowBtnBackToTop] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = () => {
    if (window.scrollY >= 20) {
      setIsShowBtnBackToTop(true);

      return;
    }

    setIsShowBtnBackToTop(false);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
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
      </Router>
      {isShowBtnBackToTop && (
        <div className="fixed right-[11.5%] bottom-[5%] z-[400]">
          <Button onClick={handleScrollToTop}>
            <BackToTopIcon />
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
