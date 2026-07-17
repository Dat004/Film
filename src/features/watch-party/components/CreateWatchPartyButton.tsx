'use client';

import { Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import CreateRoomModal from '@/components/ui/CreateRoomModal';
import { WatchPartyToast } from '@/components/ui/Toastify';
import { useAuth } from '@/features/auth';
import { logger } from '@/lib/logger';
import { pushRoute } from '@/lib/route-navigation';

import { createRoom } from '../services/watch-party.service';
import type { WatchPartyFilmMeta } from '../types/watch-party.types';

export interface CreateWatchPartyButtonProps {
  filmId: string;
  filmMeta: WatchPartyFilmMeta;
  creatingLabel?: string;
  idleLabel?: string;
  className?: string;
}

const CreateWatchPartyButton: React.FC<CreateWatchPartyButtonProps> = ({
  filmId,
  filmMeta,
  creatingLabel = 'Đang tạo...',
  idleLabel = 'Tạo Phòng Xem Chung',
  className = 'inline-flex items-center justify-center gap-[6px] rounded-[8px] bg-bg-btn-primary px-[16px] py-[10px] text-[14px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-95 disabled:pointer-events-none disabled:opacity-50',
}) => {
  const navigate = useRouter();
  const { user, uid, isLogged } = useAuth();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    if (!isLogged || !user || !uid) {
      WatchPartyToast.loginRequired('tạo phòng xem chung');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateWatchParty = async (passwordInput: string) => {
    setIsCreatingRoom(true);
    try {
      const host = {
        uid: uid || '',
        displayName: user?.displayName || 'Ẩn danh',
        photoURL: user?.photoURL || user?.photoUrl || '',
      };
      const password = passwordInput?.trim() || null;
      const roomId = await createRoom(host, filmId, filmMeta, password);
      WatchPartyToast.roomCreated({
        isPrivate: Boolean(password),
        filmName: filmMeta.name,
      });
      setIsCreateModalOpen(false);
      pushRoute(navigate, `/watch-party/${roomId}`);
    } catch (error) {
      logger.error(
        'Tạo phòng Watch Party thất bại',
        error instanceof Error ? error : new Error(String(error))
      );
      WatchPartyToast.roomCreateFailed();
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isCreatingRoom}
        onClick={handleOpenCreateModal}
        className={className}
      >
        <Users className="h-4 w-4 shrink-0" />
        {isCreatingRoom ? creatingLabel : idleLabel}
      </button>
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWatchParty}
        isCreating={isCreatingRoom}
      />
    </>
  );
};

export default CreateWatchPartyButton;
