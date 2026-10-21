import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Component under test
import { PlayerErrorBoundary } from '@/features/player/components/PlayerErrorBoundary';
import { useHlsPlayer } from '@/features/player/hooks/useHlsPlayer';
import type { PlayerRecoveryStatus } from '@/features/player/hooks/useHlsPlayer';

// Mock HLS instance helper using vi.hoisted so Vitest hoisting works seamlessly
const { MockHls, mockInstances } = vi.hoisted(() => {
  type EventHandler = (event: string, data: any) => void;

  class MockHls {
    static Events = {
      MANIFEST_PARSED: 'hlsManifestParsed',
      FRAG_BUFFERED: 'hlsFragBuffered',
      ERROR: 'hlsError',
    };

    static ErrorTypes = {
      NETWORK_ERROR: 'networkError',
      MEDIA_ERROR: 'mediaError',
      OTHER_ERROR: 'otherError',
    };

    levels: any[] = [{ height: 1080 }, { height: 720 }, { height: 480 }];
    currentLevel = -1;
    autoLevelCapping = -1;
    config = { maxBufferLength: 30, maxMaxBufferLength: 60 };

    private listeners: Record<string, EventHandler[]> = {};

    attachMedia = vi.fn();
    loadSource = vi.fn();
    detachMedia = vi.fn();
    destroy = vi.fn();
    recoverMediaError = vi.fn();
    swapAudioCodec = vi.fn();
    startLoad = vi.fn();

    on(event: string, handler: EventHandler) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event]!.push(handler);
    }

    once(event: string, handler: EventHandler) {
      const wrapped: EventHandler = (e, d) => {
        this.off(event, wrapped);
        handler(e, d);
      };
      this.on(event, wrapped);
    }

    off(event: string, handler: EventHandler) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event]!.filter((h) => h !== handler);
      }
    }

    emit(event: string, data: any) {
      const handlers = this.listeners[event] || [];
      handlers.forEach((h) => h(event, data));
    }
  }

  const mockInstances = {
    activeMockHls: null as MockHls | null,
    activeP2PEngine: null as any,
  };

  return { MockHls, mockInstances };
});

vi.mock('@/features/player/services/hls.factory', () => ({
  createHlsInstance: vi.fn(() => {
    mockInstances.activeMockHls = new MockHls();
    return mockInstances.activeMockHls;
  }),
  createHlsInstanceWithP2P: vi.fn(() => {
    mockInstances.activeMockHls = new MockHls();
    mockInstances.activeP2PEngine = { destroy: vi.fn() };
    return { hls: mockInstances.activeMockHls, engine: mockInstances.activeP2PEngine };
  }),
  destroyHlsInstance: vi.fn((hls) => {
    hls?.destroy();
  }),
  destroyP2PEngine: vi.fn((engine) => {
    engine?.destroy();
  }),
  isHlsJsSupported: vi.fn(() => true),
  canPlayNativeHls: vi.fn(() => false),
  Hls: MockHls,
}));

// Helper component that throws on demand
const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Simulation of unexpected player crash');
  }
  return <div data-testid="player-content">Player Running Normal</div>;
};

describe('Phase 2: HLS Self-Healing FSM & Player Resilient Error Boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockInstances.activeMockHls = null;
    mockInstances.activeP2PEngine = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────
  // 1. PlayerErrorBoundary Tests
  // ─────────────────────────────────────────────────────────────
  describe('PlayerErrorBoundary (Aspect-Ratio 16:9 Contextual Fallback)', () => {
    it('renders child components cleanly when no errors occur', () => {
      render(
        <PlayerErrorBoundary>
          <ProblemChild shouldThrow={false} />
        </PlayerErrorBoundary>
      );

      expect(screen.getByTestId('player-content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('catches runtime render crash without breaking layout and shows player recovery UI', () => {
      // Suppress console.error in test log for expected error boundary test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <PlayerErrorBoundary>
          <ProblemChild shouldThrow={true} />
        </PlayerErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Trình phát gặp sự cố hiển thị')).toBeInTheDocument();
      expect(screen.getByText(/Simulation of unexpected player crash/i)).toBeInTheDocument();

      spy.mockRestore();
    });

    it('recovers and calls onReset when user clicks "Thử tải lại player"', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onReset = vi.fn();

      const TestHarness = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        return (
          <PlayerErrorBoundary
            onReset={() => {
              onReset();
              setShouldThrow(false);
            }}
          >
            <ProblemChild shouldThrow={shouldThrow} />
          </PlayerErrorBoundary>
        );
      };

      render(<TestHarness />);

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /thử tải lại player/i });
      fireEvent.click(retryBtn);

      expect(onReset).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('player-content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      spy.mockRestore();
    });

    it('automatically resets error boundary when resetKeys change', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { rerender } = render(
        <PlayerErrorBoundary resetKeys={['episode-1']}>
          <ProblemChild shouldThrow={true} />
        </PlayerErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Changing resetKeys (e.g. switching to episode 2) clears the error boundary
      rerender(
        <PlayerErrorBoundary resetKeys={['episode-2']}>
          <ProblemChild shouldThrow={false} />
        </PlayerErrorBoundary>
      );

      expect(screen.getByTestId('player-content')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. HLS Self-Healing FSM Tests (4-Tier Recovery)
  // ─────────────────────────────────────────────────────────────
  describe('HLS Self-Healing State Machine', () => {
    const fakeVideo = document.createElement('video');
    const videoRef = { current: fakeVideo };

    it('Tier 1: Recovers from fatal MEDIA_ERROR via hls.recoverMediaError()', () => {
      const onReady = vi.fn();
      const onError = vi.fn();
      const onRecoveryStateChange = vi.fn();

      renderHook(() =>
        useHlsPlayer({
          videoRef,
          src: 'https://test.cdn/master.m3u8',
          onReady,
          onError,
          onTimeReset: vi.fn(),
          onRecoveryStateChange,
        })
      );

      expect(mockInstances.activeMockHls).not.toBeNull();

      // Simulate 1st fatal MEDIA_ERROR
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.MEDIA_ERROR,
          details: 'bufferStalledError',
        });
      });

      // Assert Tier 1 recovery was triggered
      expect(mockInstances.activeMockHls!.recoverMediaError).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled(); // No fatal halt
      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'recovering_media',
          attempt: 1,
          maxAttempts: 2,
        })
      );

      // Simulate 2nd fatal MEDIA_ERROR (still within threshold)
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.MEDIA_ERROR,
          details: 'bufferAppendError',
        });
      });

      expect(mockInstances.activeMockHls!.recoverMediaError).toHaveBeenCalledTimes(2);
      expect(onError).not.toHaveBeenCalled();
      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'recovering_media',
          attempt: 2,
          maxAttempts: 2,
        })
      );

      // When media continues and a segment buffers, recovery counter resets
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.FRAG_BUFFERED, {});
      });

      // 3rd media error after successful buffer is treated as fresh attempt 1
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.MEDIA_ERROR,
        });
      });

      expect(mockInstances.activeMockHls!.recoverMediaError).toHaveBeenCalledTimes(3);
      expect(onRecoveryStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: 'recovering_media',
          attempt: 1,
        })
      );
    });

    it('Tier 2: Retries fatal NETWORK_ERROR with progressive exponential backoff', () => {
      const onReady = vi.fn();
      const onError = vi.fn();
      const onRecoveryStateChange = vi.fn();

      renderHook(() =>
        useHlsPlayer({
          videoRef,
          src: 'https://test.cdn/master.m3u8',
          onReady,
          onError,
          onTimeReset: vi.fn(),
          onRecoveryStateChange,
        })
      );

      // Simulate 1st fatal NETWORK_ERROR (delay: 1000ms)
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
          details: 'manifestLoadTimeOut',
        });
      });

      expect(onError).not.toHaveBeenCalled();
      expect(mockInstances.activeMockHls!.startLoad).not.toHaveBeenCalled(); // Still waiting for backoff timer
      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'recovering_network',
          attempt: 1,
          maxAttempts: 3,
        })
      );

      // Fast-forward 1000ms -> startLoad should fire
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockInstances.activeMockHls!.startLoad).toHaveBeenCalledTimes(1);

      // Simulate 2nd fatal NETWORK_ERROR (delay: 2000ms)
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(mockInstances.activeMockHls!.startLoad).toHaveBeenCalledTimes(2);

      // Simulate 3rd fatal NETWORK_ERROR (delay: 4000ms)
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(mockInstances.activeMockHls!.startLoad).toHaveBeenCalledTimes(3);

      // 4th fatal network error exceeds max attempts (3) -> Tier 4 unrecoverable fatal error
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onRecoveryStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: 'fatal_error',
        })
      );
    });

    it('Tier 3: Gracefully falls back from P2P swarm to pure CDN without crashing or resetting position', () => {
      fakeVideo.currentTime = 125.4; // User was watching at 2m05s

      const onReady = vi.fn();
      const onError = vi.fn();
      const onRecoveryStateChange = vi.fn();

      renderHook(() =>
        useHlsPlayer({
          videoRef,
          src: 'https://test.cdn/master.m3u8',
          p2pSwarmId: 'swarm-room-xyz',
          onReady,
          onError,
          onTimeReset: vi.fn(),
          onRecoveryStateChange,
        })
      );

      const initialP2PEngine = mockInstances.activeP2PEngine;
      expect(initialP2PEngine).not.toBeNull();

      // Exhaust 3 network retries on P2P swarm
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // 4th error triggers Tier 3: Fallback from P2P to CDN
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.ERROR, {
          fatal: true,
          type: MockHls.ErrorTypes.NETWORK_ERROR,
        });
      });

      // Assert P2P was destroyed
      expect(initialP2PEngine.destroy).toHaveBeenCalled();

      // Assert onRecoveryStateChange announced CDN fallback
      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'fallback_cdn',
        })
      );

      // Verify new CDN HLS instance was created and attached
      expect(mockInstances.activeMockHls).not.toBeNull();
      expect(mockInstances.activeMockHls!.attachMedia).toHaveBeenCalledWith(fakeVideo);
      expect(mockInstances.activeMockHls!.loadSource).toHaveBeenCalledWith(
        'https://test.cdn/master.m3u8'
      );

      // Once manifest parses on CDN instance, verify position was restored
      act(() => {
        mockInstances.activeMockHls!.emit(MockHls.Events.MANIFEST_PARSED, {});
      });

      expect(fakeVideo.currentTime).toBe(125.4);
      expect(onReady).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled(); // Seamless recovery without player error screen
    });

    it('Proactive Network Detection: Detects browser offline and resumes on online', () => {
      const onReady = vi.fn();
      const onError = vi.fn();
      const onRecoveryStateChange = vi.fn();

      renderHook(() =>
        useHlsPlayer({
          videoRef,
          src: 'https://test.cdn/master.m3u8',
          onReady,
          onError,
          onTimeReset: vi.fn(),
          onRecoveryStateChange,
        })
      );

      // Simulate browser going offline
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'recovering_network',
          message: expect.stringContaining('Mất kết nối'),
        })
      );

      // Simulate browser going back online
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(onRecoveryStateChange).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'recovering_network',
          message: expect.stringContaining('Đã có kết nối mạng'),
        })
      );
      expect(mockInstances.activeMockHls!.startLoad).toHaveBeenCalled();
    });
  });
});
