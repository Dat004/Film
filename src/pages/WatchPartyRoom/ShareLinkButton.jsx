/* eslint-disable react/prop-types */
import { RiShareLine } from "react-icons/ri";

export function ShareLinkButton({ onCopy }) {
  return (
    <button 
      onClick={onCopy}
      className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors mr-1 shrink-0 flex items-center justify-center"
      title="Sao chép link phòng"
    >
      <RiShareLine className="w-5 h-5" />
    </button>
  );
}
