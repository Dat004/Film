import { useEffect, useState } from "react";

import SidebarMenu from "../defaultComponents/SidebarMenu";
import Container from "../defaultComponents/Container";
import Footer from "../defaultComponents/Footer";
import Header from "../defaultComponents/Header";
import Button from "../../components/Button";
import { BackToTopIcon } from "../../icons";

function DefaultLayout({ children }) {
  const [isShowBtnBackToTop, setIsShowBtnBackToTop] = useState(false);

  const handleScroll = () => {
    if (window.scrollY >= 20) {
      setIsShowBtnBackToTop(true);

      return;
    }

    setIsShowBtnBackToTop(false);
  };

  return (
    <div className="w-[100%]">
      <Header />
      <Container>{children}</Container>
      <SidebarMenu />
      <Footer />
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

export default DefaultLayout;
