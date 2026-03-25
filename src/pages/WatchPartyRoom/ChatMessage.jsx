/* eslint-disable react/prop-types */
import { DEFAULT_AVATAR_URL } from "./constants";

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 30000) { // < 30 seconds
    return "Vừa xong";
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    if (days === 1) return "1 ngày trước";
    return `${days} ngày trước`;
  }
  if (hours > 0) {
    return `${hours} giờ trước`;
  }
  if (minutes > 0) {
    return `${minutes} phút trước`;
  }
  return "Vừa xong";
}

export function ChatMessage({ msg, isMe, isHostMsg, senderData, isConsecutive }) {
  if (msg.type === "system") {
    return (
      <div className="flex justify-center w-full my-1 animate-fade-in">
        <div className="bg-bg-block border border-bd-filed-form-color rounded-full px-3.5 py-1 text-[11px] text-secondary font-medium tracking-wide">
          {msg.text}
        </div>
      </div>
    );
  }

  const avatarUrl = senderData?.photoURL || DEFAULT_AVATAR_URL;
  const displayName = senderData?.displayName || msg.displayName || "Ẩn danh";

  return (
    <div className={`flex flex-col w-full ${isMe ? "items-end" : "items-start"} ${isConsecutive ? "mt-0.5" : "mt-3"}`}>
       <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          
          {/* Avatar / Spacer */}
          {!isMe && (
            !isConsecutive ? (
              <img 
                src={avatarUrl} 
                className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-bd-filed-form-color" 
                alt="pf"
                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }} 
              />
            ) : (
              <div className="w-7 shrink-0" />
            )
          )}

          {/* Message Bubble + Meta */}
          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
             {/* Name & Role */}
             {!isMe && !isConsecutive && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                   <span className="text-[11px] font-semibold text-primary">{displayName}</span>
                   <span 
                     className="text-[9px] px-1.5 py-px rounded uppercase tracking-wider font-bold bg-bg-block"
                     style={{ color: isHostMsg ? "#eab308" : "#3b82f6" }}
                   >
                     {isHostMsg ? "Host" : "Viewer"}
                   </span>
                </div>
             )}
             
             {/* Bubble */}
             <div 
               className={`text-sm px-3.5 py-2 w-fit rounded-2xl shadow-sm border ${
                 isMe 
                    ? "bg-bg-btn-primary border-transparent rounded-br-sm" 
                    : "bg-bg-field text-primary border-bd-filed-form-color rounded-bl-sm"
               }`}
               style={isMe ? { color: "#fff" } : {}}
             >
               <span className="break-words whitespace-pre-line leading-relaxed">{msg.text}</span>
             </div>
             
             {/* Time / Tag under the bubble */}
             {!isConsecutive && (
               <div className={`flex items-center gap-1.5 mt-1 px-1.5 opacity-60 text-[9px] text-secondary ${isMe ? "justify-end text-right" : "justify-start text-left"}`}>
                  <span>{formatRelativeTime(msg.timestamp)}</span>
                  {isMe && <span className="font-semibold">| Bạn</span>}
               </div>
             )}
          </div>
       </div>
    </div>
  );
}
