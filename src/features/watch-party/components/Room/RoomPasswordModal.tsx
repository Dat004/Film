'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { backRoute } from '@/lib/route-navigation';

interface RoomPasswordModalProps {
  passwordError: string;
  onSubmit: (password: string) => void;
}

export function RoomPasswordModal({ passwordError, onSubmit }: RoomPasswordModalProps) {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pw = (form.elements.namedItem('roomPassword') as HTMLInputElement).value;
    onSubmit(pw);
  };

  return (
    <Dialog open onOpenChange={() => backRoute(router)}>
      <DialogContent className="flex w-full max-w-md flex-col items-center rounded-2xl border border-bd-filed-form-color bg-bg-sidebar p-8 shadow-2xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--hover-color)]/10 ring-1 ring-[var(--hover-color)]/30">
          <Lock className="h-8 w-8 text-[var(--hover-color)]" />
        </div>

        <DialogTitle className="mb-2 text-xl font-bold text-primary">Yêu cầu mật khẩu</DialogTitle>
        <DialogDescription className="mb-6 text-center text-sm text-secondary">
          Vui lòng nhập mật khẩu chính xác để tham gia phòng xem chung này.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="w-full">
          <Label htmlFor="roomPassword" className="sr-only">
            Mật khẩu phòng
          </Label>
          <Input
            id="roomPassword"
            type="password"
            name="roomPassword"
            placeholder="Mật khẩu phòng..."
            variant="room"
            className="mb-3 text-center"
            required
            autoFocus
          />
          {passwordError && (
            <p className="mb-4 text-center text-xs text-red-500">{passwordError}</p>
          )}
          <div className="flex w-full gap-3">
            <Button
              type="button"
              onClick={() => backRoute(router)}
              className="flex-1 rounded-xl border border-bd-filed-form-color bg-bg-field py-3 font-medium text-primary transition-all hover:bg-bg-menu-items"
            >
              Quay Lại
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-bg-btn-primary py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90"
            >
              Vào Phòng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RoomPasswordModal;
