'use client';

import { X, Send } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import Button from '@/components/ui/Button';

import {
  MAX_CHAT_LENGTH,
  COUNTER_THRESHOLD,
  REACTIONS,
} from '../../constants/watch-party.constants';
import { sendMessage } from '../../services/watch-party.service';
import type { UserParam } from '../../services/watch-party.service';
import type { RoomMessage, RoomMember } from '../../types/watch-party.types';

import { ChatMessage } from './ChatMessage';

export interface ChatPanelProps {
  roomId: string;
  messages: RoomMessage[];
  chatLoading?: boolean;
  chatError?: string | null;
  memberMap: Record<string, RoomMember>;
  hostId: string;
  user: UserParam | null;
  isChatOpen: boolean;
  isMobile: boolean;
  chatWidth: number;
  setIsChatOpen: (open: boolean) => void;
  onSendReaction?: (emoji: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  roomId,
  messages,
  chatLoading = false,
  chatError = null,
  memberMap,
  hostId,
  user,
  isChatOpen,
  isMobile,
  chatWidth,
  setIsChatOpen,
  onSendReaction,
}) => {
  const [chatText, setChatText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Stick to bottom when near the end or sending a message.
  const userUid = user?.uid;
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight <= 100;

      const currentMessages = messagesRef.current;
      const lastMessage = currentMessages[currentMessages.length - 1];
      const isMyMessage = lastMessage?.uid === userUid;

      if (isNearBottom || isMyMessage || currentMessages.length === 1) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages.length, userUid]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !user) return;
    await sendMessage(roomId, user, chatText);
    setChatText('');
  };

  return (
    <div
      className={`flex flex-col bg-bg-sidebar transition-all ease-in-out duration-300 shrink-0 ${!isChatOpen ? 'w-0 clm:h-0 border-none overflow-hidden opacity-0' : 'opacity-100'}`}
      style={{
        width: isChatOpen ? (isMobile ? '100%' : `${chatWidth}px`) : '0px',
        height: isMobile ? (isChatOpen ? '100%' : '0px') : '100%',
      }}
    >
      {/* Header Chat */}
      <div className="p-3 sticky top-0 border-b border-bd-filed-form-color flex flex-col shrink-0 bg-bg-sidebar">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-base font-bold text-primary">Trò chuyện nhóm</h2>

          <Button
            onClick={() => setIsChatOpen(false)}
            rounded
            className="p-2 text-secondary hover:bg-white/5 hover:text-primary shrink-0 slm:hidden"
            title="Thu gọn Chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5"
        role="log"
        aria-live="polite"
        aria-busy={chatLoading}
        aria-label="Tin nhắn phòng xem chung"
      >
        {chatLoading && (
          <p className="text-sm text-secondary text-center py-4">Đang tải tin nhắn...</p>
        )}
        {chatError && (
          <p className="text-sm text-red-500 text-center py-4" role="alert">
            {chatError}
          </p>
        )}
        {!chatLoading && !chatError && messages.length === 0 && (
          <p className="text-sm text-secondary text-center py-4">
            Chưa có tin nhắn. Hãy chào mọi người!
          </p>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.uid === user?.uid;
          const isHostMsg = msg.uid === hostId;

          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const isConsecutive = !!(
            prevMsg &&
            prevMsg.uid === msg.uid &&
            prevMsg.type !== 'system' &&
            msg.type !== 'system' &&
            msg.timestamp - prevMsg.timestamp < 120000
          );

          return (
            <ChatMessage
              key={msg.id ?? `${msg.uid}-${msg.timestamp}`}
              msg={msg}
              isMe={isMe}
              isHostMsg={isHostMsg}
              senderData={memberMap[msg.uid]}
              isConsecutive={isConsecutive}
            />
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input & Emoji Reactions Container */}
      <div className="p-3 sticky bottom-0 border-t border-bd-filed-form-color shrink-0 bg-bg-sidebar relative flex flex-col gap-2">
        {/* Emoji reactions above the message input. */}
        <div className="flex gap-3 justify-center py-0.5">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSendReaction && onSendReaction(emoji)}
              className="shrink-0 rounded-full p-1 text-xl transition-transform duration-150 hover:scale-125 hover:bg-white/5 active:scale-95"
              title={`Thả emoji ${emoji}`}
              aria-label={`Gửi phản ứng ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {chatText.length > COUNTER_THRESHOLD && (
          <div className="absolute top-0 right-4 z-10 -translate-y-full animate-fade-in rounded-t-md border border-b-0 border-bd-filed-form-color bg-bg-sidebar px-2 py-0.5 text-[10px] font-medium text-secondary shadow-sm">
            {chatText.length}/{MAX_CHAT_LENGTH}
          </div>
        )}
        <form onSubmit={handleSendChat} className="flex gap-2 relative">
          <input
            type="text"
            maxLength={MAX_CHAT_LENGTH}
            className="flex-1 rounded-full border border-bd-filed-form-color bg-bg-field py-2 pl-4 pr-12 text-[16px] text-primary outline-none transition-colors focus:border-[var(--hover-color)] detail769:text-sm"
            placeholder="Nhắn tin..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            aria-label="Nhập tin nhắn"
          />
          <Button
            type="submit"
            disabled={!chatText.trim()}
            rounded
            className="absolute bottom-1 right-1 top-1 p-1.5 text-[var(--primary-color)] hover:bg-white/5 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
