/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { RiCloseLargeFill, RiDeleteBin6Line, RiSendPlane2Fill, RiLogoutBoxRLine } from "react-icons/ri";
import { ChatMessage } from "./ChatMessage";
import { ShareLinkButton } from "./ShareLinkButton";
import { sendMessage } from "../../services/firebase/watchPartyService";
import { MAX_CHAT_LENGTH, COUNTER_THRESHOLD } from "./constants";
import Button from "../../components/Button";


export function ChatPanel({
  roomId,
  messages,
  members,
  memberMap,
  isHost,
  hostId,
  user,
  filmData,
  isChatOpen,
  isMobile,
  chatWidth,
  setIsChatOpen,
  onCopyLink,
  onDestroyRoom,
  onKick,
  onTransferHost,
  onLeaveRoom,
  onSendReaction,
  isMembersOpen = true
}) {
  const [chatText, setChatText] = useState("");
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Chat auto-scroll when new messages arrive (Smart Scroll)
  const userUid = user?.uid;
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight <= 100;
      
      const currentMessages = messagesRef.current;
      const lastMessage = currentMessages[currentMessages.length - 1];
      const isMyMessage = lastMessage?.uid === userUid;

      if (isNearBottom || isMyMessage || currentMessages.length === 1) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length, userUid]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    await sendMessage(roomId, user, chatText);
    setChatText("");
  };

  return (
    <div 
      className={`flex flex-col bg-bg-layer transition-all ease-in-out duration-300 shrink-0 ${!isChatOpen ? "w-0 clm:h-0 border-none overflow-hidden opacity-0" : "opacity-100"}`}
      style={{ 
        width: isChatOpen ? (isMobile ? "100%" : `${chatWidth}px`) : "0px", 
        height: isMobile ? (isChatOpen ? "100%" : "0px") : "100%" 
      }}
    >
      {/* Header Chat & Members List */}
      <div className="p-3 sticky top-0 border-b border-bd-filed-form-color flex flex-col shrink-0 bg-bg-layer">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-base font-bold text-[var(--primary-color)]">
            Trò chuyện nhóm
          </h2>

          <Button 
            onClick={() => setIsChatOpen(false)}
            rounded
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/10 shrink-0 max-[768px]:hidden"
            title="Thu gọn Chat"
          >
            <RiCloseLargeFill className="w-4 h-4" />
          </Button>
        </div>
      </div>


      {/* Chat List */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5">
        {messages.map((msg, idx) => {
          const isMe = msg.uid === user?.uid;
          const isHostMsg = msg.uid === hostId;
          
          const prevMsg = idx > 0 ? messages[idx - 1] : null;
          const isConsecutive = prevMsg &&
                                prevMsg.uid === msg.uid &&
                                prevMsg.type !== "system" &&
                                msg.type !== "system" &&
                                (msg.timestamp - prevMsg.timestamp < 120000); // 2 phút

          return (
            <ChatMessage 
              key={idx} 
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
      <div className="p-3 sticky bottom-0 border-t border-bd-filed-form-color shrink-0 bg-bg-layer relative flex flex-col gap-2">
        {/* Emoji Reactions Bar (Sát trên ô nhập tin) */}
        <div className="flex gap-3 justify-center py-0.5">
          {["👍", "❤️", "😂", "🔥", "😮"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction && onSendReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform duration-150 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 shrink-0"
              title={`Thả emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {chatText.length > COUNTER_THRESHOLD && (
          <div className="absolute top-0 right-4 -translate-y-full bg-bg-layer border border-b-0 border-black/10 dark:border-white/10 px-2 py-0.5 rounded-t-md text-[10px] text-gray-500 font-medium z-10 animate-fade-in shadow-sm">
            {chatText.length}/{MAX_CHAT_LENGTH}
          </div>
        )}
        <form onSubmit={handleSendChat} className="flex gap-2 relative">
          <input 
            type="text" 
            maxLength={MAX_CHAT_LENGTH}
            className="flex-1 bg-bg-field border border-bd-filed-form-color focus:border-[var(--hover-color)] transition-colors rounded-full pl-4 pr-12 py-2 outline-none text-sm text-primary"
            placeholder="Nhắn tin..."
            value={chatText}
            onChange={e => setChatText(e.target.value)}
          />
          <Button 
            type="submit" 
            disabled={!chatText.trim()}
            rounded
            className="absolute right-1 top-1 bottom-1 text-[var(--primary-color)] disabled:opacity-50 hover:bg-black/5 dark:hover:bg-white/10 p-1.5"
          >
            <RiSendPlane2Fill className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
