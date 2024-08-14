import Container from "../defaultComponents/Container";
import Footer from "../defaultComponents/Footer";
import Header from "../defaultComponents/Header";

function DefaultLayout({ children }) {
  return (
    <div className="w-[100%]">
      <Header />
      <Container>{children}</Container>
      <Footer />
    </div>
  );
}

export default DefaultLayout;
