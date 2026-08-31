'use client';

import React, { useEffect, useRef } from 'react';

import type { RoomReaction } from '../types/watch-party.types';

interface Particle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
}

interface WatchPartyCanvasReactionsProps {
  reactions?: Record<string, RoomReaction> | null | undefined;
  className?: string;
}

export const WatchPartyCanvasReactions: React.FC<WatchPartyCanvasReactionsProps> = ({
  reactions,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const isFirstRenderRef = useRef(true);
  const animFrameIdRef = useRef<number | null>(null);

  // Resize canvas dimensions on element resize via ResizeObserver (avoids layout thrashing in rAF)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const stopLoop = () => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  const startLoop = () => {
    if (animFrameIdRef.current !== null) return; // already running

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        stopLoop();
        return;
      }

      const ctx = canvas.getContext('2d');
      const particles = particlesRef.current;

      if (!ctx || particles.length === 0) {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        stopLoop();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p) continue;

        p.y -= p.vy;
        p.x += Math.sin(p.y / 20) * 0.8;
        p.alpha -= 0.02;

        if (p.alpha <= 0 || p.y < -50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.font = `${Math.round(28 * p.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stopLoop();
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);
  };

  // Handle incoming reactions from Firebase
  useEffect(() => {
    if (!reactions) return;

    const entries = Object.entries(reactions);
    if (entries.length === 0) return;

    if (isFirstRenderRef.current) {
      entries.forEach(([id]) => processedIdsRef.current.add(id));
      isFirstRenderRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    const width = canvas?.width || 800;
    const height = canvas?.height || 450;

    entries.forEach(([id, item]) => {
      if (processedIdsRef.current.has(id)) return;
      processedIdsRef.current.add(id);

      const startX = width * (0.15 + Math.random() * 0.7);

      particlesRef.current.push({
        id,
        emoji: item.emoji || '❤️',
        x: startX,
        y: height - 30,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 3.0 + Math.random() * 2.5,
        alpha: 1.0,
        scale: 0.8 + Math.random() * 0.5,
      });
    });

    const MAX_PARTICLES = 30;
    if (particlesRef.current.length > MAX_PARTICLES) {
      particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
    }

    if (processedIdsRef.current.size > 300) {
      processedIdsRef.current.clear();
    }

    if (particlesRef.current.length > 0) {
      startLoop();
    }
  }, [reactions]);

  useEffect(() => {
    return () => stopLoop();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-[85] h-full w-full ${className}`}
    />
  );
};

export default WatchPartyCanvasReactions;
