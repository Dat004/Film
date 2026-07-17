'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { LegacyModal as Modal } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

export interface PartyModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  widthClassName?: string;
}

/** Shared modal shell for watch-party dialogs. */
export const PartyModalShell: React.FC<PartyModalShellProps> = ({
  open,
  onClose,
  title,
  children,
  className,
  bodyClassName,
  widthClassName = 'w-[400px] max-w-[90vw]',
}) => {
  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          'bg-bg-sidebar border border-bd-filed-form-color rounded-2xl shadow-2xl p-4 overflow-hidden relative flex flex-col max-h-[80vh]',
          widthClassName,
          className
        )}
      >
        <div className="flex justify-between items-center pb-3 border-b border-bd-filed-form-color mb-3 shrink-0">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">{title}</h3>
          <Button
            onClick={onClose}
            rounded
            className="p-1 text-secondary transition-colors hover:bg-white/5 hover:text-primary"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className={cn('overflow-y-auto pr-1 min-h-0', bodyClassName)}>{children}</div>
      </motion.div>
    </Modal>
  );
};

export default PartyModalShell;
