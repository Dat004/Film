'use client';

import { Eye, EyeOff, X, Lock } from 'lucide-react';
import React, { useState } from 'react';

import Button from '@/components/ui/Button';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from './Dialog';
import { Input } from './Input';
import { Label } from './Label';

export interface CreateRoomModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (password: string) => void;
  isCreating?: boolean;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  isCreating = false,
}) => {
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setIsShowPassword((state) => !state);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-panel-surface mx-auto w-[420px] mdm:w-[85%] kdm:w-[90%] overflow-hidden rounded-[12px] border border-bd-filed-form-color bg-bg-sidebar p-[24px]">
        <div className="mb-[20px] flex items-center justify-between gap-3">
          <DialogTitle className="flex items-center gap-2 text-[18px] font-bold text-primary">
            <Lock className="size-5 shrink-0 text-[var(--hover-color)]" aria-hidden />
            Cài Đặt Phòng Xem Chung
          </DialogTitle>
          <Button
            type="button"
            onClick={onClose}
            rounded
            className="!p-2 text-secondary hover:bg-bg-menu-items hover:text-primary"
            aria-label="Đóng"
            disabled={isCreating}
          >
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <DialogDescription className="mb-[16px] whitespace-pre-line text-[13.5px] leading-relaxed text-secondary">
            Đặt mật khẩu nếu bạn muốn tạo phòng riêng tư. Bạn bè sẽ cần nhập mật khẩu này để tham
            gia.{' '}
            <strong className="font-medium text-primary">
              Để trống nếu muốn tạo phòng công khai.
            </strong>
          </DialogDescription>

          <div className="relative mb-[20px] flex w-full">
            <Label htmlFor="roomPassword" className="sr-only">
              Mật khẩu phòng
            </Label>
            <Input
              id="roomPassword"
              name="roomPassword"
              placeholder="Mật khẩu phòng (không bắt buộc)..."
              variant="compact"
              className="pr-[42px]"
              type={isShowPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isCreating}
              autoComplete="new-password"
            />
            <div className="absolute right-[12px] top-1/2 flex -translate-y-1/2 items-center justify-center">
              <Button
                type="button"
                onClick={handleTogglePassword}
                className="!p-1 !text-items hover:text-primary"
                aria-label={isShowPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                disabled={isCreating}
              >
                {isShowPassword ? (
                  <Eye className="size-[18px]" />
                ) : (
                  <EyeOff className="size-[18px]" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-[12px]">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="h-[44px] flex-1 rounded-[8px] border border-bd-filed-form-color bg-bg-field text-[14px] font-medium text-primary transition-colors hover:bg-bg-menu-items disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="h-[44px] flex-1 rounded-[8px] bg-bg-btn-primary text-[14px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Phòng'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
