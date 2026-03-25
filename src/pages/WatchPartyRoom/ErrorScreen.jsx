/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { RiArrowGoBackLine, RiHome4Line, RiErrorWarningLine } from "react-icons/ri";

export function ErrorScreen({ error, onGoBack }) {
  return (
    <div className="flex items-center justify-center w-full h-[calc(100vh-60px)] mt-[60px] bg-bg-layout text-primary px-4 fixed inset-0 z-[99999]">
      <div className="max-w-md w-full bg-bg-sidebar border border-bd-filed-form-color rounded-2xl p-8 shadow-2xl text-center animate-fade-in relative z-10">
        <div className="flex items-center justify-center mb-6">
          <section className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center ring-1 ring-red-500/30 shadow-[0_0_40px_rgba(229,9,20,0.15)]">
            <RiErrorWarningLine className="w-10 h-10 text-red-500" />
          </section>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-primary">Rất tiếc!</h2>
        <p className="text-secondary mb-8 text-[15px] leading-relaxed">
          {error}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button 
            onClick={onGoBack} 
            className="flex-1 bg-bg-field hover:bg-black/5 dark:hover:bg-white/5 border border-bd-filed-form-color text-primary font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RiArrowGoBackLine className="w-5 h-5" />
            Quay Lại
          </button>
          <Link 
            to="/" 
            className="flex-1 bg-[#e50914] hover:opacity-90 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <RiHome4Line className="w-5 h-5" />
            Trang Chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
