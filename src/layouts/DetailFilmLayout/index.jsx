import Footer from "../defaultComponents/Footer";
import Header from "../defaultComponents/Header";

function DetailFilmLayout({ children }) {
  return (
    <div className="w-[100%]">
      <Header />
      <main className="mx-auto">
        <section className="h-full min-h-[550px] pt-[80px]">{children}</section>
      </main>
      <Footer />
    </div>
  );
}

export default DetailFilmLayout;
