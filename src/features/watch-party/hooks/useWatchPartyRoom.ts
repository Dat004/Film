import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';

import { WatchPartyToast } from '@/components/ui/Toastify';
import { useVideoPlayerStore } from '@/features/player';
import { copyTextToClipboard } from '@/lib/clipboard';
import { logger } from '@/lib/logger';
import { pushRoute } from '@/lib/route-navigation';

import type { UserParam } from '../services/watch-party.service';
import {
  destroyRoom,
  kickMember,
  transferHost,
  sendReaction,
} from '../services/watch-party.service';

import { useChatResize } from './useChatResize';
import { useRoomSync } from './useRoomSync';
import { useVideoSync } from './useVideoSync';

export interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
  size: number;
  duration: number;
  rotation: number;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'primary' | 'danger' | 'warning';
  onConfirm: () => void;
}

export function useWatchPartyRoom(roomId: string, user: UserParam | null, isLogged: boolean) {
  const router = useRouter();
  const { uid } = user || {};

  const episode = useVideoPlayerStore((state) => state.episode);
  const { currentEpisode } = episode;

  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [isEpisodesOpen, setIsEpisodesOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const stableUser = useMemo(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      displayName: user.displayName || 'Ẩn danh',
      photoURL: user.photoURL || '',
    };
  }, [uid, user?.displayName, user?.photoURL]);

  const {
    roomData,
    error,
    isInitializing,
    isHost,
    messages,
    chatLoading,
    chatError,
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword,
  } = useRoomSync(roomId, stableUser, isLogged);

  useVideoSync(roomId, isHost, isInitializing, roomData?.status);

  const { isChatOpen, setIsChatOpen, chatWidth, setIsDragging, isMobile } = useChatResize();

  const prevReactionsRef = useRef<Record<string, any>>({});
  useEffect(() => {
    const currentReactions = roomData?.reactions || {};
    Object.keys(currentReactions).forEach((rId) => {
      if (!prevReactionsRef.current[rId]) {
        const reaction = currentReactions[rId];
        if (reaction && Date.now() - reaction.timestamp < 4000) {
          const id = rId;
          const left = Math.random() * 70 + 15;
          const size = Math.random() * 20 + 24;
          const duration = Math.random() * 1.2 + 1.5;
          const rotation = Math.random() * 40 - 20;

          setReactions((prev) => [
            ...prev,
            { id, emoji: reaction.emoji, left, size, duration, rotation },
          ]);

          setTimeout(
            () => {
              setReactions((prev) => prev.filter((r) => r.id !== id));
            },
            duration * 1000 + 100
          );
        }
      }
    });
    prevReactionsRef.current = currentReactions;
  }, [roomData?.reactions]);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    type: 'primary',
    onConfirm: () => {},
  });

  const handleCopyLink = async () => {
    const ok = await copyTextToClipboard(window.location.href);
    if (ok) WatchPartyToast.linkCopied();
    else WatchPartyToast.linkCopyFailed();
  };

  const handleDestroyRoom = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Giải tán phòng chiếu',
      message:
        'Hành động này sẽ giải tán phòng ngay lập tức. Tất cả mọi người đang xem sẽ bị thoát ra ngoài. Bạn có chắc chắn?',
      confirmText: 'Giải tán phòng',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: async () => {
        try {
          await destroyRoom(roomId);
          pushRoute(router, '/watch-party');
        } catch (err) {
          WatchPartyToast.destroyFailed();
        }
      },
    });
  };

  const handleSendReaction = async (emoji: string) => {
    if (!user) return;
    try {
      await sendReaction(roomId, user, emoji);
    } catch (err) {
      logger.error('Lỗi khi gửi emoji', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleLeaveRoom = () => {
    const confirmMessage =
      isHost && members.length > 1
        ? 'Bạn đang là chủ phòng. Nếu bạn rời đi, quyền điều khiển phòng (Host) sẽ được tự động chuyển giao cho thành viên tiếp theo. Bạn có chắc chắn muốn rời phòng?'
        : 'Bạn có chắc chắn muốn rời khỏi phòng xem chung này? Bạn sẽ không còn đồng bộ video với mọi người nữa.';

    setConfirmModal({
      isOpen: true,
      title: 'Rời phòng xem chung',
      message: confirmMessage,
      confirmText: 'Rời phòng',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: () => {
        pushRoute(router, '/watch-party');
      },
    });
  };

  const handleKickMember = (memberId: string, displayName?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Mời thành viên rời phòng',
      message: `Bạn có chắc chắn muốn mời thành viên "${displayName || 'Ẩn danh'}" ra khỏi phòng xem chung này?`,
      confirmText: 'Mời rời phòng',
      cancelText: 'Hủy',
      type: 'danger',
      onConfirm: async () => {
        try {
          await kickMember(roomId, memberId);
          WatchPartyToast.memberKicked(displayName);
        } catch (err) {
          WatchPartyToast.kickFailed();
        }
      },
    });
  };

  const handleTransferHost = (memberId: string, displayName?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Chuyển quyền chủ phòng',
      message: `Bạn có chắc chắn muốn chuyển quyền chủ phòng cho "${displayName || 'Ẩn danh'}"? Bạn sẽ trở thành người xem thường và không thể điều khiển trình phát video nữa.`,
      confirmText: 'Chuyển quyền',
      cancelText: 'Hủy',
      type: 'warning',
      onConfirm: async () => {
        try {
          await transferHost(roomId, memberId);
          WatchPartyToast.hostTransferred(displayName);
        } catch (err) {
          WatchPartyToast.transferFailed();
        }
      },
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    roomId,
    user,
    isLogged,
    currentEpisode,
    reactions,
    isEpisodesOpen,
    setIsEpisodesOpen,
    activeTab,
    setActiveTab,
    isMembersModalOpen,
    setIsMembersModalOpen,
    isInfoModalOpen,
    setIsInfoModalOpen,
    roomData,
    error,
    isInitializing,
    isHost,
    messages,
    chatLoading,
    chatError,
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword,
    isChatOpen,
    setIsChatOpen,
    chatWidth,
    setIsDragging,
    isMobile,
    confirmModal,
    handleCopyLink,
    handleDestroyRoom,
    handleSendReaction,
    handleLeaveRoom,
    handleKickMember,
    handleTransferHost,
    closeConfirmModal,
  };
}

export default useWatchPartyRoom;
