/* eslint-disable react/prop-types */
import { FaCrown, FaUserMinus } from "react-icons/fa6";
import { DEFAULT_AVATAR_URL, MAX_MEMBERS } from "./constants";

export function MemberList({ members, isHost, hostId, user, onKick, onTransferHost }) {
  const sortedMembers = [...members].sort((a, b) => a.joinedAt - b.joinedAt);
  const displayMembers = sortedMembers.slice(0, MAX_MEMBERS);
  const remainingCount = Math.max(0, sortedMembers.length - MAX_MEMBERS);

  return (
    <div className="mt-3 flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1 pb-1">
      {displayMembers.map(m => (
         <div key={m.uid} className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-transparent border border-black/5 dark:border-white/5 hover:shadow-sm transition-all h-9">
           <img 
             src={m.photoURL || DEFAULT_AVATAR_URL} 
             alt="pf" 
             className="w-6 h-6 rounded-full object-cover shrink-0" 
             onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR_URL; }} 
           />
           <span className={`text-[13px] max-w-[110px] truncate ${m.uid === user.uid ? "font-bold text-[var(--primary-color)]" : "text-gray-800 dark:text-gray-200 font-medium"}`}>
              {m.displayName}
           </span>
           {m.uid === hostId && (
             <FaCrown className="text-[13px] text-yellow-500 shrink-0" title="Chủ Phòng" />
           )}

           {/* Host Controls */}
           {isHost && m.uid !== user.uid && (
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button 
                  onClick={() => onTransferHost && onTransferHost(m.uid, m.displayName)} 
                  className="text-[10px] bg-gray-100 hover:bg-blue-500 hover:text-white dark:bg-white/10 dark:hover:bg-blue-500 text-gray-600 dark:text-gray-300 font-medium px-2 py-1 rounded-md transition-colors flex items-center gap-1" 
                  title="Chuyển quyền Chủ phòng"
                >
                  <FaCrown className="text-[11px] opacity-80" />
                  Host
                </button>
                <button 
                  onClick={() => onKick && onKick(m.uid, m.displayName)} 
                  className="text-[10px] bg-gray-100 hover:bg-red-500 hover:text-white dark:bg-white/10 dark:hover:bg-red-500 text-gray-600 dark:text-gray-300 font-medium px-2 py-1 rounded-md transition-colors flex items-center gap-1" 
                  title="Mời ra khỏi phòng"
                >
                  <FaUserMinus className="text-[11px]" />
                  Kick
                </button>
              </div>
           )}
         </div>
      ))}
      {remainingCount > 0 && (
         <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 h-9">
           <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">+{remainingCount}</span>
         </div>
      )}
    </div>
  );
}
