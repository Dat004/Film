'use client';

import { Activity, Users, Download, HardDrive } from 'lucide-react';
import React from 'react';

import type { P2PStats } from '../lib/p2p-hls-config';

export interface VideoP2PStatsProps {
  stats: P2PStats;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export const VideoP2PStats: React.FC<VideoP2PStatsProps> = ({ stats, className = '' }) => {
  const { httpBytes, p2pBytes, peerCount, p2pRatio } = stats;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md text-xs text-secondary ${className}`}
      title="P2P Video Segment Sharing (WebRTC)"
    >
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-[var(--primary-color)] animate-pulse" />
        <span className="font-semibold text-primary">{peerCount} peers</span>
      </div>

      <div className="h-3 w-px bg-white/10" />

      <div className="flex items-center gap-1.5">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-medium text-emerald-400">{p2pRatio}% P2P</span>
      </div>

      <div className="h-3 w-px bg-white/10" />

      <div className="flex items-center gap-2 text-[11px]">
        <span className="flex items-center gap-1 text-emerald-300">
          <Download className="w-3 h-3" />
          {formatBytes(p2pBytes)}
        </span>
        <span className="text-secondary/60">/</span>
        <span className="flex items-center gap-1 text-secondary">
          <HardDrive className="w-3 h-3" />
          {formatBytes(httpBytes)}
        </span>
      </div>
    </div>
  );
};

export default VideoP2PStats;
