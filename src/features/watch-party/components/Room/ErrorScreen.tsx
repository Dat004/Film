import { ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export interface ErrorScreenProps {
  error: string | null;
  onGoBack?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onGoBack }) => {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-60px)] mt-[60px] bg-bg-layout text-primary px-4 fixed inset-0 z-[99999]">
      <div className="max-w-md w-full bg-bg-sidebar border border-bd-filed-form-color rounded-2xl p-8 shadow-2xl text-center animate-fade-in relative z-10">
        <div className="flex items-center justify-center mb-6">
          <section className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center ring-1 ring-red-500/30 shadow-[0_0_40px_rgba(229,9,20,0.15)]">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </section>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-primary">Rất tiếc!</h2>
        <p className="text-secondary mb-8 text-[15px] leading-relaxed">{error}</p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={onGoBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-bd-filed-form-color bg-bg-field px-4 py-3 font-medium text-primary transition-all hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay Lại
          </button>
          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bg-btn-primary px-4 py-3 font-medium text-white shadow-lg transition-all hover:opacity-90"
          >
            <Home className="w-5 h-5" />
            Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
