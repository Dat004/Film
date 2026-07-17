'use client';

import { motion } from 'framer-motion';
import { Bookmark, Clapperboard, Users, X } from 'lucide-react';
import React, { useState } from 'react';

import images from '@/assets/images';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import Image from '@/components/ui/Image';
import { ToastMessage } from '@/components/ui/Toastify';

import { useAuth } from '../hooks/useAuth';

import GoogleButtonLogin from './GoogleButtonLogin';

export interface LoginModalProps {
  onClose?: () => void;
  isShowModal?: boolean;
}

const PERKS = [
  { icon: Bookmark, label: 'Lưu danh sách xem' },
  { icon: Clapperboard, label: 'Tiếp tục đúng chỗ dừng' },
  { icon: Users, label: 'Xem chung với bạn bè' },
] as const;

const LoginModal: React.FC<LoginModalProps> = ({ onClose = () => {}, isShowModal = false }) => {
  const { loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      ToastMessage.success('Đăng nhập thành công!');
      onClose();
    } catch {
      ToastMessage.error('Đăng nhập không thành công. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isShowModal} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="w-full max-w-[420px] mdm:max-w-[min(92vw,400px)] p-0 border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="login-modal relative overflow-hidden rounded-[18px] bg-bg-sidebar border border-bd-filed-form-color modal-panel-surface"
        >
          {/* Atmospheric stage */}
          <div className="login-modal-stage relative h-[148px] overflow-hidden" aria-hidden>
            <div className="login-modal-stage-fill absolute inset-0" />
            <div className="absolute inset-0 opacity-[0.18] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220%200%20120%20120%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.55%22/></svg>')]" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--login-stage-fade)] to-transparent" />

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/35 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/50 hover:text-white disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2.2} />
            </button>

            <div className="absolute inset-0 flex items-end px-7 pb-5">
              <Image
                src={images.logo}
                alt="Logo"
                className="!h-9 !w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>

          <div className="relative px-7 pb-7 pt-1">
            <DialogTitle className="font-[Montserrat,sans-serif] text-[26px] leading-tight font-bold tracking-[-0.02em] text-primary">
              Đăng nhập
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-[34ch] text-[14px] leading-relaxed text-secondary">
              Đồng bộ danh sách, tiếp tục xem và tham gia phòng chiếu cùng bạn bè.
            </DialogDescription>

            <div className="mt-6">
              <GoogleButtonLogin
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleLogin()}
                isLoading={isSubmitting}
              />
            </div>

            <ul className="mt-6 grid gap-2.5">
              {PERKS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[13px] text-secondary">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(255,101,0,0.12)] text-[var(--hover-color)]">
                    <Icon className="size-3.5" strokeWidth={2.25} />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-center text-[11.5px] leading-relaxed text-items">
              Chỉ dùng Google — không lưu mật khẩu trên hệ thống.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
