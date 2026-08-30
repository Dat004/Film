import { describe, it, expect } from 'vitest';
import { parseM3u8Segments } from '@/features/player/hooks/useMediaPrefetch';

describe('Smart Segment Prefetching & Service Worker Media Cache', () => {
  const sampleM3u8 = `
    #EXTM3U
    #EXT-X-VERSION:3
    #EXT-X-TARGETDURATION:10
    #EXTINF:10.0,
    segment-001.ts
    #EXTINF:10.0,
    segment-002.ts
    #EXTINF:10.0,
    segment-003.ts
    #EXTINF:10.0,
    segment-004.ts
    #EXT-X-ENDLIST
  `;

  it('parses m3u8 playlist text and extracts absolute segment URLs', () => {
    const baseUrl = 'https://stream.example.com/hls/ep2/index.m3u8';
    const segments = parseM3u8Segments(sampleM3u8, baseUrl, 3);

    expect(segments).toHaveLength(3);
    expect(segments[0]).toBe('https://stream.example.com/hls/ep2/segment-001.ts');
    expect(segments[1]).toBe('https://stream.example.com/hls/ep2/segment-002.ts');
    expect(segments[2]).toBe('https://stream.example.com/hls/ep2/segment-003.ts');
  });

  it('respects maxSegments limit when parsing', () => {
    const baseUrl = 'https://stream.example.com/hls/ep2/index.m3u8';
    const segments = parseM3u8Segments(sampleM3u8, baseUrl, 2);

    expect(segments).toHaveLength(2);
    expect(segments[1]).toBe('https://stream.example.com/hls/ep2/segment-002.ts');
  });

  it('handles absolute segment URLs in m3u8 correctly', () => {
    const m3u8WithAbsoluteUrls = `
#EXTM3U
#EXTINF:10.0,
https://cdn.example.com/chunk-a.ts
#EXTINF:10.0,
https://cdn.example.com/chunk-b.ts
`;
    const segments = parseM3u8Segments(m3u8WithAbsoluteUrls, 'https://stream.example.com/ep2.m3u8', 5);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toBe('https://cdn.example.com/chunk-a.ts');
    expect(segments[1]).toBe('https://cdn.example.com/chunk-b.ts');
  });
});
