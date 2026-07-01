import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import EpisodesPlayer from "@/features/player/components/episodes-player";
import { ChatPanel } from "./ChatPanel";

interface MobileTabViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  roomData: any;
  dataEpisodes: any[];
  currentEpisode: number;
  roomId: string;
  messages: any[];
  members: any[];
  memberMap: any;
  isHost: boolean;
  user: any;
  handleCopyLink: () => void;
  handleDestroyRoom: () => void;
  handleKickMember: (memberId: string, displayName: string) => void;
  handleTransferHost: (memberId: string, displayName: string) => void;
  handleLeaveRoom: () => void;
  handleSendReaction: (emoji: string) => void;
}

export function MobileTabView({
  activeTab,
  setActiveTab,
  roomData,
  dataEpisodes,
  currentEpisode,
  roomId,
  messages,
  members,
  memberMap,
  isHost,
  user,
  handleCopyLink,
  handleDestroyRoom,
  handleKickMember,
  handleTransferHost,
  handleLeaveRoom,
  handleSendReaction,
}: MobileTabViewProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg-layout md:hidden">
      {/* Tab Bar */}
      <div className="flex justify-around bg-bg-sidebar border-b border-bd-filed-form-color h-[45px] items-center shrink-0 select-none">
        {["info", "episodes", "chat"].map((tab) => {
          const label = tab === "info" ? "Phim" : tab === "episodes" ? "Tập" : "Chat";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full px-4 text-xs font-semibold relative transition-colors ${
                activeTab === tab ? "text-[var(--primary-color)]" : "text-secondary"
              }`}
            >
              {label}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--primary-color)]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="p-4 flex flex-col gap-4 select-text"
            >
              <div>
                <span className="text-[10px] font-semibold text-hover tracking-wider uppercase">ĐANG XEM CHIẾU CHUNG</span>
                <h2 className="text-base font-bold mt-0.5 text-primary">{roomData.filmData?.movie?.name}</h2>
                <p className="text-xs text-secondary mt-0.5">{dataEpisodes[currentEpisode]?.name || "Tập 1"}</p>
              </div>

              <div className="flex gap-2 items-center select-none">
                <div className="bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded flex items-center gap-1 text-[11px] text-secondary">
                  <span>❤️</span>
                  <span className="font-semibold text-primary">2</span>
                </div>
                <div className="bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded flex items-center gap-1 text-[11px] text-secondary">
                  <span>😂</span>
                  <span className="font-semibold text-primary">1</span>
                </div>
              </div>

              <div className="border-t border-bd-filed-form-color pt-3">
                <h4 className="font-bold text-xs mb-1 text-primary">Nội dung phim</h4>
                <p className="text-[11px] text-secondary whitespace-pre-line">
                  {roomData.filmData?.movie?.content || "Không có mô tả"}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "episodes" && (
            <motion.div
              key="episodes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative h-full"
            >
              <EpisodesPlayer dataEpisodes={dataEpisodes} />
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative flex flex-col h-full"
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
                isChatOpen={true}
                isMobile={true}
                chatWidth="100%"
                setIsChatOpen={() => {}}
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
      </div>
    </div>
  );
}
