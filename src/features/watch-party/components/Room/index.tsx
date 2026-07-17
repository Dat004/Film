'use client';

import { AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import React, { useMemo } from 'react';

import ConfirmModal from '@/components/ui/ConfirmModal';
import ContentModal from '@/components/ui/ContentModal';
import PlayerSkeleton from '@/components/ui/PlayerSkeleton';
import { useAuth } from '@/features/auth';
import { pushRoute } from '@/lib/route-navigation';

import { useWatchPartyFilm } from '../../hooks/useWatchPartyFilm';
import { useWatchPartyRoom } from '../../hooks/useWatchPartyRoom';

import ErrorScreen from './ErrorScreen';
import MemberList from './MemberList';
import PartyModalShell from './PartyModalShell';
import RoomDesktopLayout from './RoomDesktopLayout';
import RoomHeader from './RoomHeader';
import RoomMobileView from './RoomMobileView';
import RoomPasswordModal from './RoomPasswordModal';

const WatchPartyRoom: React.FC = () => {
  const params = useParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId : '';
  const { uid, user, isLogged } = useAuth();

  const watchPartyUser = useMemo(() => {
    if (!uid) return null;
    return {
      uid,
      displayName: (user?.displayName as string | undefined) || 'Ẩn danh',
      photoURL:
        (user?.photoURL as string | undefined) || (user?.photoUrl as string | undefined) || '',
    };
  }, [uid, user?.displayName, user?.photoURL, user?.photoUrl]);

  const {
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
    confirmModal,
    handleCopyLink,
    handleDestroyRoom,
    handleSendReaction,
    handleLeaveRoom,
    handleKickMember,
    handleTransferHost,
    closeConfirmModal,
  } = useWatchPartyRoom(roomId, watchPartyUser, isLogged);

  const {
    filmData,
    isLoading: filmLoading,
    error: filmError,
  } = useWatchPartyFilm(roomData?.filmId, roomData?.filmData);

  const router = useRouter();

  if (error) {
    return <ErrorScreen error={error} onGoBack={() => pushRoute(router, '/watch-party')} />;
  }

  if (passwordRequired) {
    return <RoomPasswordModal passwordError={passwordError} onSubmit={submitPassword} />;
  }

  if (filmError) {
    return <ErrorScreen error={filmError} onGoBack={() => pushRoute(router, '/watch-party')} />;
  }

  if (isInitializing || !roomData || filmLoading || !filmData) {
    return <PlayerSkeleton />;
  }

  const movieData = filmData?.['movie'] as Record<string, unknown> | undefined;
  const episodesData = filmData?.['episodes'] as Array<{ server_data: unknown[] }> | undefined;
  const dataEpisodes = episodesData?.map((item) => item?.server_data)?.find(Boolean) ?? [];
  const episodeItem = (dataEpisodes as Array<{ name?: string }>)[currentEpisode];

  const sharedChatProps = {
    roomId,
    messages,
    chatLoading,
    chatError,
    memberMap,
    hostId: roomData.hostId,
    user: watchPartyUser,
    onSendReaction: handleSendReaction,
  };

  return (
    <div className="flex h-dvh w-full select-none flex-col overflow-hidden bg-bg-layout text-primary">
      <RoomHeader
        filmName={String(movieData?.['name'] ?? '')}
        episodeName={episodeItem?.name ?? 'Tập 1'}
        memberCount={members.length}
        isHost={isHost}
        onLeave={handleLeaveRoom}
        onDestroyRoom={handleDestroyRoom}
        onCopyLink={handleCopyLink}
      />

      <div className="watch-party-container relative flex flex-row 2xlm:flex-col flex-1 w-full bg-bg-layout text-primary overflow-hidden min-h-0">
        <RoomDesktopLayout
          isEpisodesOpen={isEpisodesOpen}
          setIsEpisodesOpen={setIsEpisodesOpen}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          isMembersModalOpen={isMembersModalOpen}
          setIsMembersModalOpen={setIsMembersModalOpen}
          isInfoModalOpen={isInfoModalOpen}
          setIsInfoModalOpen={setIsInfoModalOpen}
          chatWidth={chatWidth}
          setIsDragging={setIsDragging}
          dataEpisodes={dataEpisodes}
          sharedChatProps={sharedChatProps}
          isHost={isHost}
        >
          <RoomMobileView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            movieData={movieData}
            episodeItem={episodeItem}
            dataEpisodes={dataEpisodes}
            roomData={roomData}
            user={watchPartyUser}
            sharedChatProps={sharedChatProps}
            filmData={filmData}
            reactions={reactions}
            isChatOpen={isChatOpen}
            isHost={isHost}
          />
        </RoomDesktopLayout>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      <ContentModal
        content={String(movieData?.['content'] ?? '')}
        title="Nội dung phim"
        isShowModal={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <AnimatePresence>
        {isMembersModalOpen && (
          <PartyModalShell
            open={isMembersModalOpen}
            onClose={() => setIsMembersModalOpen(false)}
            title="Thành viên trong phòng"
          >
            {watchPartyUser && (
              <MemberList
                members={members}
                isHost={isHost}
                hostId={roomData.hostId}
                user={watchPartyUser}
                onKick={handleKickMember}
                onTransferHost={handleTransferHost}
                variant="rows"
              />
            )}
          </PartyModalShell>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchPartyRoom;
