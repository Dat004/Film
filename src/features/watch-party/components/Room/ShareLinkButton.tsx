import { Share2 } from 'lucide-react';
import React from 'react';

export interface ShareLinkButtonProps {
  onCopy?: () => void;
}

export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ onCopy }) => {
  return (
    <button
      onClick={onCopy}
      className="mr-1 flex shrink-0 items-center justify-center rounded-full p-2 text-secondary transition-colors hover:bg-white/5 hover:text-primary"
      title="Sao chép link phòng"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
};

export default ShareLinkButton;
