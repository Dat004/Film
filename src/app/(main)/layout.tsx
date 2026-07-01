import * as React from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full">
      <Header />
      <main className="relative h-full min-h-[550px] pt-[80px] mb-[40px]">
        <div className="3xl:w-width-layout-3xl 2xl:w-width-layout-2xl xl:w-width-layout-xl px-[15px] mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
