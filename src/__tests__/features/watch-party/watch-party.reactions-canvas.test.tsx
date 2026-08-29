import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import WatchPartyCanvasReactions from '@/features/watch-party/components/WatchPartyCanvasReactions';
import type { RoomReaction } from '@/features/watch-party/types/watch-party.types';

describe('Phase 1.3: High-FPS Canvas 2D Floating Emoji Reactions', () => {
  beforeEach(() => {
    // Mock HTMLCanvasElement getContext 2D API for jsdom testing
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      globalAlpha: 1,
      font: '',
      textAlign: 'center',
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(cb, 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });
  });

  it('renders canvas element cleanly without throwing errors', () => {
    const { container } = render(<WatchPartyCanvasReactions reactions={null} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('pointer-events-none');
  });

  it('handles reactions object and initializes rendering loop', () => {
    const mockReactions: Record<string, RoomReaction> = {
      r1: {
        uid: 'user1',
        displayName: 'User A',
        emoji: '❤️',
        timestamp: Date.now(),
      },
      r2: {
        uid: 'user2',
        displayName: 'User B',
        emoji: '🔥',
        timestamp: Date.now(),
      },
    };

    const { container } = render(<WatchPartyCanvasReactions reactions={mockReactions} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
