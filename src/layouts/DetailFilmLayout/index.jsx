import Footer from "../defaultComponents/Footer";
import Header from "../defaultComponents/Header";

function DetailFilmLayout({ children }) {
  return (
    <div className="w-[100%]">
      <Header />
      <div className="mx-auto">
        <div className="h-full min-h-[550px] pt-[80px]">{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default DetailFilmLayout;
