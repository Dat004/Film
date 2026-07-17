'use client';

import { X, AlertTriangle } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from './Dialog';

export interface ConfirmModalProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'warning';
  onConfirm?: () => void;
  onCancel?: () => void;
}

const CONFIRM_BTN: Record<NonNullable<ConfirmModalProps['type']>, string> = {
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
  primary: 'bg-bg-btn-primary text-white hover:opacity-90 shadow-sm',
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen = false,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'primary',
  onConfirm = () => {},
  onCancel = () => {},
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="modal-panel-surface mx-auto w-[400px] mdm:w-[85%] kdm:w-[90%] overflow-hidden rounded-[12px] border border-bd-filed-form-color bg-bg-sidebar p-[24px]">
        <div className="mb-[16px] flex items-center justify-between gap-3">
          <DialogTitle className="flex items-center gap-2 text-[16.5px] font-bold text-primary">
            {type === 'danger' ? (
              <AlertTriangle className="size-5 shrink-0 text-red-500" aria-hidden />
            ) : null}
            {type === 'warning' ? (
              <AlertTriangle className="size-5 shrink-0 text-amber-500" aria-hidden />
            ) : null}
            {title}
          </DialogTitle>
          <Button
            onClick={onCancel}
            rounded
            className="!p-2 text-secondary hover:bg-bg-menu-items hover:text-primary"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mb-[20px]">
          <DialogDescription className="whitespace-pre-line text-[13.5px] leading-relaxed text-secondary">
            {message}
          </DialogDescription>
        </div>

        <div className="flex justify-end gap-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="h-[38px] rounded-[8px] border border-bd-filed-form-color bg-bg-field px-5 text-[13px] font-medium text-primary transition-colors hover:bg-bg-menu-items"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={cn(
              'h-[38px] rounded-[8px] px-5 text-[13px] font-semibold transition-all',
              CONFIRM_BTN[type]
            )}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
