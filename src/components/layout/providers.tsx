"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { usePreviewStore } from "@/features/watch-party/stores/preview-store";
import PreviewFilmElement from "@/components/Element/PreviewFilmElement";
import Button from "@/components/ui/button";
import { BackToTopIcon } from "@/icons";

// Initialize QueryClient once for the entire application session
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Throttled Global Preview Handler Component
function GlobalPreviewProvider() {
  const isShowPreview = usePreviewStore((state) => state.isShowPreview);
  const currentPreviewData = usePreviewStore((state) => state.currentPreviewData);
  const setShowPreview = usePreviewStore((state) => state.setShowPreview);

  if (!isShowPreview) return null;

  return (
    <PreviewFilmElement
      data={currentPreviewData}
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      className="fixed w-[275px] z-[8000]"
    />
  );
}

export function Providers({ children, ...props }: ThemeProviderProps) {
  const queryClient = getQueryClient();
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // Task 5.1: Apply requestAnimationFrame scroll throttling
  React.useEffect(() => {
    let ticking = false;

    const handleScrollThrottled = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY >= 150) {
            setShowBackToTop(true);
          } else {
            setShowBackToTop(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScrollThrottled, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollThrottled);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...props}>
        {children}
        <GlobalPreviewProvider />
        {showBackToTop && (
          <div className="fixed right-[11.5%] bottom-[5%] z-[4000] mdm:right-[5%]">
            <Button
              onClick={handleScrollToTop}
              className="bg-[var(--bg-accent-pink)] hover:scale-115 transition-transform duration-200 !rounded-[50%] p-[12px] text-dark shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center"
            >
              <BackToTopIcon />
            </Button>
          </div>
        )}
      </NextThemesProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
