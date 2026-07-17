'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { List, MessageCircle, Users, Info, X, Send } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { EpisodesPlayer } from '@/features/player';

import ChatPanel from './ChatPanel';
import type { ChatPanelProps } from './ChatPanel';

export interface RoomDesktopLayoutProps {
  isEpisodesOpen: boolean;
  setIsEpisodesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMembersModalOpen: boolean;
  setIsMembersModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatWidth: number;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  dataEpisodes: unknown[];
  sharedChatProps: Omit<ChatPanelProps, 'isChatOpen' | 'isMobile' | 'chatWidth' | 'setIsChatOpen'>;
  /** Only the host may pick a different episode; guests see a locked list. */
  isHost: boolean;
  /** Center content (video + mobile tabs) rendered between sidebar and chat */
  children: React.ReactNode;
}

const RoomDesktopLayout: React.FC<RoomDesktopLayoutProps> = ({
  isEpisodesOpen,
  setIsEpisodesOpen,
  isChatOpen,
  setIsChatOpen,
  isMembersModalOpen,
  setIsMembersModalOpen,
  isInfoModalOpen,
  setIsInfoModalOpen,
  chatWidth,
  setIsDragging,
  dataEpisodes,
  sharedChatProps,
  isHost,
  children,
}) => {
  return (
    <>
      {/* Left Thin Sidebar (Desktop only) */}
      <div className="w-[60px] 2xlm:hidden bg-bg-sidebar border-r border-bd-filed-form-color flex flex-col items-center py-6 gap-6 shrink-0 z-20">
        <Button
          onClick={() => setIsEpisodesOpen((prev) => !prev)}
          className={`relative rounded-xl p-2.5 transition-all hover:bg-white/5 group ${isEpisodesOpen ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-secondary'}`}
          title="Danh sách tập"
        >
          <List className="w-5 h-5" />
          <span className="pointer-events-none absolute left-[70px] z-[1002] whitespace-nowrap rounded border border-bd-filed-form-color bg-bg-sidebar px-2 py-1 text-xs text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Danh sách tập
          </span>
        </Button>

        <Button
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`relative rounded-xl p-2.5 transition-all hover:bg-white/5 group ${isChatOpen ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-secondary'}`}
          title="Trò chuyện"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="pointer-events-none absolute left-[70px] z-[1002] whitespace-nowrap rounded border border-bd-filed-form-color bg-bg-sidebar px-2 py-1 text-xs text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Khung chat
          </span>
        </Button>

        <Button
          onClick={() => setIsMembersModalOpen(true)}
          className={`relative rounded-xl p-2.5 transition-all hover:bg-white/5 group ${isMembersModalOpen ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-secondary'}`}
          title="Thành viên"
        >
          <Users className="w-5 h-5" />
          <span className="pointer-events-none absolute left-[70px] z-[1002] whitespace-nowrap rounded border border-bd-filed-form-color bg-bg-sidebar px-2 py-1 text-xs text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Thành viên
          </span>
        </Button>

        <Button
          onClick={() => setIsInfoModalOpen(true)}
          className={`relative rounded-xl p-2.5 transition-all hover:bg-white/5 group ${isInfoModalOpen ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-secondary'}`}
          title="Thông tin phim"
        >
          <Info className="w-5 h-5" />
          <span className="pointer-events-none absolute left-[70px] z-[1002] whitespace-nowrap rounded border border-bd-filed-form-color bg-bg-sidebar px-2 py-1 text-xs text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Thông tin phim
          </span>
        </Button>
      </div>

      {/* Collapsible Episode List Drawer (Desktop only) */}
      <AnimatePresence>
        {isEpisodesOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0, zIndex: 1 }}
            animate={{ x: 0, opacity: 1, zIndex: 999 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute left-[60px] top-0 bottom-0 w-[300px] bg-bg-sidebar border-r border-bd-filed-form-color z-[999] shadow-2xl flex flex-col 2xlm:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-bd-filed-form-color bg-bg-sidebar p-4">
              <h3 className="text-sm font-bold text-primary">Danh sách tập</h3>
              <button
                onClick={() => setIsEpisodesOpen(false)}
                className="rounded p-1 text-secondary transition-all hover:bg-white/5 hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto relative">
              <EpisodesPlayer dataEpisodes={dataEpisodes} disabled={!isHost} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center content: video + mobile tabs */}
      {children}

      {/* Resize Bar */}
      {isChatOpen && (
        <div
          className="relative z-[100] flex w-[8px] shrink-0 cursor-col-resize items-center justify-center bg-white/5 transition-colors hover:bg-[var(--primary-color)] 2xlm:hidden"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="pointer-events-none flex flex-col gap-1 opacity-50">
            <div className="h-1.5 w-[1.5px] rounded-full bg-secondary" />
            <div className="h-1.5 w-[1.5px] rounded-full bg-secondary" />
            <div className="h-1.5 w-[1.5px] rounded-full bg-secondary" />
          </div>
        </div>
      )}

      {/* Desktop Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: chatWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="2xlm:hidden flex flex-col border-l border-bd-filed-form-color h-full shrink-0 overflow-hidden"
          >
            <ChatPanel
              {...sharedChatProps}
              isChatOpen={isChatOpen}
              isMobile={false}
              chatWidth={chatWidth}
              setIsChatOpen={setIsChatOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed right-0 top-1/2 z-[10000] flex -translate-y-1/2 flex-col items-center gap-3 rounded-l-xl border border-r-0 border-bd-filed-form-color bg-bg-sidebar px-2 py-6 text-secondary shadow-lg transition-all hover:bg-white/5 hover:text-primary 2xlm:hidden"
          title="Mở Chat"
        >
          <Send className="w-5 h-5 -rotate-45" />
          <span className="text-[11px] font-semibold tracking-wider uppercase [writing-mode:vertical-lr]">
            Trò chuyện
          </span>
        </button>
      )}
    </>
  );
};

export default RoomDesktopLayout;
