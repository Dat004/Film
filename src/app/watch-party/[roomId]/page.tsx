import dynamic from "next/dynamic";

const WatchPartyRoomClient = dynamic(
  () => import("@/features/watch-party/components/watch-party-room-client"),
  { ssr: false }
);

interface PageProps {
  params: {
    roomId: string;
  };
}

export default function WatchPartyRoomPage({ params }: PageProps) {
  return <WatchPartyRoomClient roomId={params.roomId} />;
}
