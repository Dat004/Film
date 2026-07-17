'use client';

import {
  Check,
  CircleAlert,
  Info,
  TriangleAlert,
  UserPlus,
  UserMinus,
  Crown,
  Link2,
  DoorOpen,
  Shield,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';

import { cn } from '@/lib/utils';

export interface CustomToastContainerProps {
  [key: string]: unknown;
}

const iconClass = 'size-[15px] shrink-0';

export const CustomToastContainer: React.FC<CustomToastContainerProps> = ({ ...props }) => {
  const { resolvedTheme } = useTheme();
  const sonnerTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return (
    <Toaster
      position="top-right"
      closeButton
      gap={8}
      visibleToasts={4}
      theme={sonnerTheme}
      className="toaster-app"
      icons={{
        close: <X className="size-[14px]" strokeWidth={2} />,
      }}
      toastOptions={{
        duration: 3400,
        classNames: {
          toast: 'group toast-app',
          title: 'toast-app__title',
          description: 'toast-app__desc',
          closeButton: 'toast-app__close',
          icon: 'toast-app__icon',
          success: 'toast-app--success',
          error: 'toast-app--error',
          info: 'toast-app--info',
          warning: 'toast-app--warning',
        },
      }}
      style={{ zIndex: 1300 }}
      {...props}
    />
  );
};

type ToastBody = string | { title: string; description?: string };

type ToastOpts = {
  duration?: number;
  id?: string | number;
};

function splitBody(body: ToastBody): { title: string; description?: string } {
  if (typeof body === 'string') return { title: body };
  return body;
}

function show(
  kind: 'success' | 'error' | 'info' | 'warning',
  body: ToastBody,
  icon: React.ReactNode,
  options: ToastOpts = {}
) {
  const { title, description } = splitBody(body);
  const payload: {
    icon: React.ReactNode;
    description?: string;
    duration?: number;
    id?: string | number;
  } = { icon };

  if (description) payload.description = description;
  if (options.duration != null) payload.duration = options.duration;
  if (options.id != null) payload.id = options.id;

  sonnerToast[kind](title, payload);
}

export const ToastMessage = {
  success: (body: ToastBody, options?: ToastOpts) =>
    show(
      'success',
      body,
      <Check className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />,
      options
    ),
  error: (body: ToastBody, options?: ToastOpts) =>
    show(
      'error',
      body,
      <CircleAlert className={cn(iconClass, 'text-[var(--toast-error)]')} strokeWidth={2.25} />,
      options
    ),
  info: (body: ToastBody, options?: ToastOpts) =>
    show(
      'info',
      body,
      <Info className={cn(iconClass, 'text-[var(--toast-info)]')} strokeWidth={2.25} />,
      options
    ),
  warning: (body: ToastBody, options?: ToastOpts) =>
    show(
      'warning',
      body,
      <TriangleAlert className={cn(iconClass, 'text-[var(--toast-warning)]')} strokeWidth={2.25} />,
      options
    ),
};

/** Watch-party notification helpers. */
export const WatchPartyToast = {
  memberJoined: (displayName?: string | null) => {
    const name = displayName?.trim() || 'Người xem';
    show(
      'success',
      { title: 'Đã vào phòng', description: name },
      <UserPlus className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />,
      { duration: 2800 }
    );
  },

  memberLeft: (displayName?: string | null) => {
    const name = displayName?.trim() || 'Người xem';
    show(
      'info',
      { title: 'Đã rời phòng', description: name },
      <UserMinus className={cn(iconClass, 'text-secondary')} strokeWidth={2.25} />,
      { duration: 2800 }
    );
  },

  hostChanged: (displayName?: string | null) => {
    const name = displayName?.trim() || 'Thành viên';
    show(
      'info',
      {
        title: 'Chủ phòng mới',
        description: `${name} đang điều khiển phòng`,
      },
      <Crown className={cn(iconClass, 'text-[var(--toast-warning)]')} strokeWidth={2.25} />,
      { duration: 3600 }
    );
  },

  roomCreated: (opts: { isPrivate: boolean; filmName?: string }) => {
    show(
      'success',
      {
        title: opts.isPrivate ? 'Phòng riêng tư đã tạo' : 'Phòng công khai đã tạo',
        description: opts.filmName
          ? opts.isPrivate
            ? `${opts.filmName} · cần mật khẩu để vào`
            : opts.filmName
          : opts.isPrivate
            ? 'Cần mật khẩu để tham gia'
            : 'Mọi người có thể tham gia',
      },
      opts.isPrivate ? (
        <Shield className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />
      ) : (
        <DoorOpen className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />
      ),
      { duration: 3600 }
    );
  },

  roomCreateFailed: () => {
    ToastMessage.error({
      title: 'Không tạo được phòng',
      description: 'Kiểm tra kết nối mạng rồi thử lại',
    });
  },

  linkCopied: () => {
    show(
      'success',
      { title: 'Đã sao chép link', description: 'Gửi link để mời người khác vào phòng' },
      <Link2 className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />,
      { duration: 2600 }
    );
  },

  linkCopyFailed: () => {
    ToastMessage.error({
      title: 'Không sao chép được',
      description: 'Thử lại hoặc copy thủ công từ thanh địa chỉ',
    });
  },

  memberKicked: (displayName?: string | null) => {
    const name = displayName?.trim() || 'Thành viên';
    ToastMessage.success({
      title: 'Đã mời ra khỏi phòng',
      description: name,
    });
  },

  kickFailed: () => {
    ToastMessage.error({
      title: 'Không mời được thành viên',
      description: 'Vui lòng thử lại sau',
    });
  },

  hostTransferred: (displayName?: string | null) => {
    const name = displayName?.trim() || 'Thành viên';
    show(
      'success',
      {
        title: 'Đã chuyển chủ phòng',
        description: `${name} hiện là người điều khiển`,
      },
      <Crown className={cn(iconClass, 'text-[var(--toast-success)]')} strokeWidth={2.25} />
    );
  },

  transferFailed: () => {
    ToastMessage.error({
      title: 'Không chuyển được quyền',
      description: 'Vui lòng thử lại sau',
    });
  },

  destroyFailed: () => {
    ToastMessage.error({
      title: 'Không giải tán được phòng',
      description: 'Vui lòng thử lại sau',
    });
  },

  loginRequired: (action = 'sử dụng Watch Party') => {
    ToastMessage.warning({
      title: 'Cần đăng nhập',
      description: `Vui lòng đăng nhập để ${action}`,
    });
  },
};
