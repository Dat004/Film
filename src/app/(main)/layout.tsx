'use client';

import React from 'react';

import Container from '@/components/shared/Container';
import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="w-full">
      <Header />
      <Container>{children}</Container>
      <Footer />
    </div>
  );
}
