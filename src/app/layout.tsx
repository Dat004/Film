import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/components/layout/providers";
import { AuthListenerProvider } from "@/features/auth/components/auth-listener-provider";
import { Toaster } from "sonner";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const sfPro = localFont({
  src: [
    {
      path: "../assets/fonts/SF-UI-Display-Light.95c05a5.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/SF-UI-Display-Regular.64924ba.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/SF-UI-Display-Semibold.43b6b0c.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/SF-UI-Display-Bold.30f8651.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xem Phim Online | Xem Không Giới Hạn Phim Hay",
  description: "Trang web xem phim trực tuyến hàng đầu, đồng hành cùng bạn xem các phim hành động, viễn tưởng, anime hay mới nhất.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${sfPro.variable} font-sans antialiased`}>
        <Providers
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthListenerProvider>
            {children}
          </AuthListenerProvider>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
