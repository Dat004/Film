'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

import Container from '@/components/shared/Container';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { WatchPartyToast } from '@/components/ui/Toastify';
import { useAuth } from '@/features/auth';
import { replaceRoute } from '@/lib/route-navigation';

export interface WatchPartyLayoutProps {
  children: React.ReactNode;
}

export default function WatchPartyLayout({ children }: WatchPartyLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLogged, isLoading } = useAuth();
  const redirectedRef = useRef(false);

  const isRoomPage = Boolean(pathname && /^\/watch-party\/[^/]+/.test(pathname));

  useEffect(() => {
    if (isLoading || redirectedRef.current) return;

    if (!isLogged) {
      redirectedRef.current = true;
      WatchPartyToast.loginRequired();
      replaceRoute(router, '/');
    }
  }, [isLogged, isLoading, router]);

  if (isLoading || !isLogged) {
    return null;
  }

  // Room: fullscreen immersive chrome (no site header/footer)
  if (isRoomPage) {
    return <>{children}</>;
  }

  // Lobby: same shell as the rest of the site
  return (
    <div className="w-full">
      <Header />
      <Container>{children}</Container>
      <Footer />
    </div>
  );
}
