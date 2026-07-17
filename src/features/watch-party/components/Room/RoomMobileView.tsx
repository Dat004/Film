'use client';

import React from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Player, EpisodesPlayer } from '@/features/player';
import { sanitizeFilmHtml } from '@/lib/film-detail';

import type { UserParam } from '../../services/watch-party.service';
import type { WatchPartyRoom } from '../../types/watch-party.types';

import ChatPanel from './ChatPanel';
import type { ChatPanelProps } from './ChatPanel';

interface Reaction {
  id: string;
  emoji: string;
  left: number;
  duration: number;
  size: number;
  rotation: number;
}

export interface RoomMobileViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  movieData: Record<string, unknown> | undefined;
  episodeItem: { name?: string } | undefined;
  dataEpisodes: unknown[];
  roomData: WatchPartyRoom;
  user: UserParam | null;
  sharedChatProps: Omit<ChatPanelProps, 'isChatOpen' | 'isMobile' | 'chatWidth' | 'setIsChatOpen'>;
  filmData: Record<string, unknown>;
  reactions: Reaction[];
  isChatOpen: boolean;
  isHost: boolean;
}

const TABS = [
  { id: 'info', label: 'Phim' },
  { id: 'episodes', label: 'Tập' },
  { id: 'chat', label: 'Chat' },
];

const RoomMobileView: React.FC<RoomMobileViewProps> = ({
  activeTab,
  setActiveTab,
  movieData,
  episodeItem,
  dataEpisodes,
  sharedChatProps,
  filmData,
  reactions,
  isChatOpen,
  isHost,
}) => {
  return (
    <div className="relative flex-1 h-full bg-black flex flex-col min-h-0 overflow-hidden">
      <div className="relative w-full aspect-video bg-black shrink-0">
        <Player data={filmData} isWatchParty={true} isChatOpen={isChatOpen} isHost={isHost} />

        <div className="absolute inset-x-0 bottom-16 top-[60%] pointer-events-none z-[999] overflow-hidden">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-0 pointer-events-none"
              style={{
                left: `${r.left}%`,
                animation: `floatUp ${r.duration}s ease-out forwards`,
              }}
            >
              <span
                className="block select-none"
                style={{
                  fontSize: `${r.size}px`,
                  transform: `rotate(${r.rotation}deg)`,
                }}
              >
                {r.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 hidden 2xlm:flex flex-col bg-bg-layout">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList className="w-full">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 relative overflow-hidden min-h-0 bg-bg-layout">
            <TabsContent
              value="info"
              className="p-4 flex flex-col gap-4 select-text overflow-y-auto mt-0"
            >
              <div>
                <span className="text-[10px] font-semibold text-hover tracking-wider uppercase">
                  ĐANG XEM CHIẾU CHUNG
                </span>
                <h2 className="text-base font-bold mt-0.5 text-primary">
                  {String(movieData?.['name'] ?? '')}
                </h2>
                <p className="text-xs text-secondary mt-0.5">{episodeItem?.name ?? 'Tập 1'}</p>
              </div>
              <div className="border-t border-bd-filed-form-color pt-3">
                <h4 className="font-bold text-xs mb-1 text-primary">Nội dung phim</h4>
                {movieData?.['content'] ? (
                  <div
                    className="film-html-content text-[11px] text-secondary leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeFilmHtml(String(movieData['content'])),
                    }}
                  />
                ) : (
                  <p className="text-[11px] text-secondary">Không có mô tả</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="episodes" className="mt-0">
              <EpisodesPlayer dataEpisodes={dataEpisodes} disabled={!isHost} />
            </TabsContent>

            <TabsContent value="chat" className="flex flex-col mt-0">
              <ChatPanel
                {...sharedChatProps}
                isChatOpen={true}
                isMobile={true}
                chatWidth={350}
                setIsChatOpen={() => {}}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default RoomMobileView;
