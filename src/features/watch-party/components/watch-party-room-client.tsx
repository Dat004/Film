"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineChevronLeft } from "react-icons/hi2";
import {
  RiCloseLargeFill,
  RiSendPlane2Fill,
  RiGroupLine,
  RiDeleteBin6Line,
} from "react-icons/ri";

import { usePlayerStore } from "@/features/player/stores/player-store";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import PlayerSkeleton from "@/components/Skeleton/PlayerSkeleton";
import Player from "@/features/player/components/player-container";
import { toast } from "sonner";
import ConfirmModal from "@/components/ui/confirm-modal";
import ContentModal from "@/components/ui/content-modal";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";

// Submodules
import { ErrorScreen } from "./ErrorScreen";
import { ChatPanel } from "./ChatPanel";
import { MemberList } from "./MemberList";
import { ShareLinkButton } from "./ShareLinkButton";
import { PasswordModal } from "./password-modal";
import { FloatingReactions } from "./floating-reactions";
import { MobileTabView } from "./mobile-tab-view";
import { DesktopSidebar } from "./desktop-sidebar";

// Hooks
import { useRoomSync } from "../hooks/use-room-sync";
import { useVideoSync } from "../hooks/use-video-sync";
import { useChatResize } from "../hooks/use-chat-resize";
import { useRoomActions } from "../hooks/use-room-actions";

interface WatchPartyRoomClientProps {
  roomId: string;
}

export function WatchPartyRoomClient({ roomId }: WatchPartyRoomClientProps) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const userStore = useAuthStore((state) => state.userInfo);
  const uid = useAuthStore((state) => state.uid);

  const currentEpisode = usePlayerStore((state) => state.episode.currentEpisode);

  // States
  const [isEpisodesOpen, setIsEpisodesOpen] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("chat");
  const [isMembersModalOpen, setIsMembersModalOpen] = React.useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = React.useState(false);

  // Stable user reference
  const user = React.useMemo(() => {
    return {
      uid: uid || "",
      displayName: userStore?.displayName || "Ẩn danh",
      photoURL: userStore?.photoUrl || "",
    };
  }, [uid, userStore?.displayName, userStore?.photoUrl]);

  // Presence & room sync state
  const {
    roomData,
    error,
    isInitializing,
    isHost,
    messages,
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword,
  } = useRoomSync(roomId, user, isLoggedIn) as any;

  // Video synchronization state
  useVideoSync(roomId, isHost, isInitializing, roomData?.status);

  // Chat resize state
  const {
    isChatOpen,
    setIsChatOpen,
    chatWidth,
    setIsDragging,
  } = useChatResize() as any;

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = React.useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "primary",
    onConfirm: () => {},
  });

  const {
    handleDestroyRoom,
    handleSendReaction,
    handleLeaveRoom,
    handleKickMember,
    handleTransferHost,
  } = useRoomActions({
    roomId,
    user,
    isHost,
    members,
    router,
    setConfirmModal,
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link phòng!");
    }
  };

  if (error) {
    return <ErrorScreen error={error} onGoBack={() => router.push("/watch-party")} />;
  }

  // Room Password Modal
  if (passwordRequired) {
    return <PasswordModal passwordError={passwordError} submitPassword={submitPassword} />;
  }

  if (isInitializing || !roomData || !roomData.filmData) {
    return <PlayerSkeleton />;
  }

  const episodes = roomData?.filmData?.episodes;
  const dataEpisodes =
    episodes
      ?.map((items: any) => items?.server_data)
      ?.find((value: any) => value) || [];

  return (
    <div className="flex flex-col h-screen w-full bg-bg-layout text-primary overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="h-[60px] border-b border-bd-filed-form-color flex items-center justify-between px-4 bg-bg-sidebar shrink-0 z-30">
        <div className="flex items-center min-w-0">
          <Button
            onClick={handleLeaveRoom}
            rounded
            className="mr-2 p-2 text-secondary hover:text-red-500 hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
            title="Rời phòng"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </Button>

          <section>
            <p className="font-bold text-xs text-hover tracking-wider uppercase shrink-0">Phòng Xem Chung</p>
            <h1 className="font-bold text-sm text-primary truncate max-w-[160px] sm:max-w-[300px] md:max-w-[500px]">
              {roomData.filmData?.movie?.name}
            </h1>
          </section>

          <span className="ml-5 px-2 py-0.5 rounded leading-[1rem] bg-bg-field text-[11px] font-semibold text-secondary shrink-0">
            {dataEpisodes[currentEpisode]?.name || "Tập 1"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs text-secondary flex items-center gap-1.5 bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{members.length} đang xem</span>
          </div>

          <ShareLinkButton onCopy={handleCopyLink} />

          {isHost && (
            <Button
              onClick={handleDestroyRoom}
              rounded
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-500/10 shrink-0"
              title="Giải tán phòng"
            >
              <RiDeleteBin6Line className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace below header */}
      <div className="watch-party-container relative flex flex-row max-[768px]:flex-col w-full flex-1 min-h-0 bg-bg-layout text-gray-900 dark:text-white overflow-hidden">
        
        <DesktopSidebar 
          isEpisodesOpen={isEpisodesOpen}
          setIsEpisodesOpen={setIsEpisodesOpen}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          setIsMembersModalOpen={setIsMembersModalOpen}
          setIsInfoModalOpen={setIsInfoModalOpen}
          dataEpisodes={dataEpisodes}
        />

        {/* Main Content Area (Video + Details or Mobile Tabs) */}
        <div className="relative flex-1 h-full bg-black flex flex-col min-h-0 overflow-hidden">
          {/* Video Container (Edge-to-edge aspect-video) */}
          <div className="relative w-full aspect-video bg-black shrink-0">
            <Player data={roomData.filmData} isWatchParty={true}  />
            <FloatingReactions reactionsData={roomData.reactions} />
          </div>

          {/* Mobile View: Sticky Tab Bar & Content underneath the video */}
          <MobileTabView 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            roomData={roomData}
            dataEpisodes={dataEpisodes}
            currentEpisode={currentEpisode}
            roomId={roomId}
            messages={messages}
            members={members}
            memberMap={memberMap}
            isHost={isHost}
            user={user}
            handleCopyLink={handleCopyLink}
            handleDestroyRoom={handleDestroyRoom}
            handleKickMember={handleKickMember}
            handleTransferHost={handleTransferHost}
            handleLeaveRoom={handleLeaveRoom}
            handleSendReaction={handleSendReaction}
          />
        </div>

        {/* Resize Bar (Only for desktop when chat is open) */}
        {isChatOpen && (
          <div
            className="w-[8px] slm:hidden cursor-col-resize hover:bg-[var(--primary-color)] transition-colors z-[100] bg-black/20 dark:bg-white/5 relative flex items-center justify-center shrink-0"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="flex flex-col gap-1 opacity-50 pointer-events-none">
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Desktop View: Chat Section */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: chatWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="slm:hidden flex flex-col border-l border-bd-filed-form-color h-full shrink-0 overflow-hidden"
            >
              <ChatPanel
                roomId={roomId}
                messages={messages}
                members={members}
                memberMap={memberMap}
                isHost={isHost}
                hostId={roomData.hostId}
                user={user}
                filmData={roomData.filmData}
                isChatOpen={isChatOpen}
                isMobile={false}
                chatWidth={chatWidth}
                setIsChatOpen={setIsChatOpen}
                onCopyLink={handleCopyLink}
                onDestroyRoom={handleDestroyRoom}
                onKick={handleKickMember}
                onTransferHost={handleTransferHost}
                onLeaveRoom={handleLeaveRoom}
                onSendReaction={handleSendReaction}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Restore Chat Button (Floating on Video player for Desktop) */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed top-1/2 right-0 -translate-y-1/2 z-[8000] bg-bg-layer border border-r-0 border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-gray-300 hover:text-white px-2 py-6 rounded-l-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 transition-all slm:hidden"
            title="Mở Chat"
          >
            <RiSendPlane2Fill className="w-5 h-5 -rotate-45" />
            <span className="text-[11px] font-semibold tracking-wider uppercase [writing-mode:vertical-lr]">
              Trò chuyện
            </span>
          </button>
        )}

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type as any}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* Content Info Modal */}
        <ContentModal
          content={roomData.filmData?.movie?.content || "Chưa có mô tả chi tiết."}
          isShowModal={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
        />

        {/* Members List Modal */}
        <AnimatePresence>
          {isMembersModalOpen && (
            <Modal onClose={() => setIsMembersModalOpen(false)}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-bg-sidebar border border-bd-filed-form-color w-[400px] max-w-[90vw] rounded-2xl shadow-2xl p-4 overflow-hidden relative flex flex-col max-h-[80vh]"
              >
                <div className="flex justify-between items-center pb-3 border-b border-bd-filed-form-color mb-3">
                  <h3 className="font-bold text-base text-primary flex items-center gap-2">
                    <RiGroupLine className="w-5 h-5 text-[var(--primary-color)]" />
                    Thành viên trong phòng
                  </h3>
                  <Button
                    onClick={() => setIsMembersModalOpen(false)}
                    rounded
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 text-secondary hover:text-primary transition-colors"
                  >
                    <RiCloseLargeFill className="w-4 h-4" />
                  </Button>
                </div>

                <div className="overflow-y-auto pr-1">
                  <MemberList
                    members={members}
                    isHost={isHost}
                    hostId={roomData.hostId}
                    user={user}
                    onKick={handleKickMember}
                    onTransferHost={handleTransferHost}
                  />
                </div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default WatchPartyRoomClient;

