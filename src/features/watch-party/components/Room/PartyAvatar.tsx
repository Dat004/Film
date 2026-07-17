'use client';

import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { DEFAULT_AVATAR_URL } from '../../constants/watch-party.constants';

export interface PartyAvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
}

/** Plain img + no-referrer so Google avatars (lh3.googleusercontent.com) load. */
export const PartyAvatar: React.FC<PartyAvatarProps> = ({
  src,
  alt = '',
  size = 28,
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const url = !failed && src ? src : DEFAULT_AVATAR_URL;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full object-cover bg-bg-block', className)}
      style={{ width: size, height: size }}
    />
  );
};

export default PartyAvatar;
