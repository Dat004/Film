'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { LegacyModal as Modal } from '@/components/ui/Dialog';
import { sanitizeFilmHtml } from '@/lib/film-detail';

export interface ContentModalProps {
  content?: string;
  onClose?: () => void;
  isShowModal?: boolean;
  title?: string;
}

/** Shared modal shell for film description content. */
const ContentModal: React.FC<ContentModalProps> = ({
  content = '',
  onClose = () => {},
  isShowModal = false,
  title = 'Nội dung phim',
}) => {
  if (!isShowModal) return null;

  const safeHtml = content ? sanitizeFilmHtml(content) : '';

  return (
    <Modal onClose={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-bg-sidebar border border-bd-filed-form-color w-[520px] max-w-[92vw] rounded-2xl shadow-2xl p-4 overflow-hidden relative flex flex-col max-h-[80vh]"
      >
        <div className="flex justify-between items-center pb-3 border-b border-bd-filed-form-color mb-3 shrink-0">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">{title}</h3>
          <Button
            onClick={onClose}
            rounded
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 text-secondary hover:text-primary transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto pr-1 min-h-0 max-h-[min(60vh,480px)]">
          {safeHtml ? (
            <div
              className="film-html-content text-[14px] font-normal text-primary/90 leading-[1.65] whitespace-normal break-words [&_p]:mb-[8px] [&_p]:whitespace-normal [&_p:last-child]:mb-0 [&_strong]:text-primary [&_b]:text-primary"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          ) : (
            <p className="text-[14px] text-secondary">Chưa có mô tả chi tiết.</p>
          )}
        </div>
      </motion.div>
    </Modal>
  );
};

export default ContentModal;
