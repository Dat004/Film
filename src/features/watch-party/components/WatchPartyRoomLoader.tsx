'use client';

import dynamic from 'next/dynamic';

import PlayerSkeleton from '@/components/ui/PlayerSkeleton';

const WatchPartyRoom = dynamic(() => import('./Room'), {
  ssr: false,
  loading: () => <PlayerSkeleton />,
});

export default function WatchPartyRoomLoader() {
  return <WatchPartyRoom />;
}
