import * as React from "react";

interface FloatingReactionsProps {
  reactionsData?: Record<string, any>;
}

export function FloatingReactions({ reactionsData }: FloatingReactionsProps) {
  const [reactions, setReactions] = React.useState<any[]>([]);
  const prevReactionsRef = React.useRef<Record<string, any>>({});
  
  React.useEffect(() => {
    const currentReactions = reactionsData || {};
    Object.keys(currentReactions).forEach((rId) => {
      if (!prevReactionsRef.current[rId]) {
        const reaction = currentReactions[rId];
        if (Date.now() - reaction.timestamp < 4000) {
          const id = rId;
          const left = Math.random() * 70 + 15; // 15% to 85%
          const size = Math.random() * 20 + 24; // 24px to 44px
          const duration = Math.random() * 1.2 + 1.5; // 1.5s to 2.7s
          const rotation = Math.random() * 40 - 20; // -20deg to 20deg
          
          setReactions((prev) => [
            ...prev,
            { id, emoji: reaction.emoji, left, size, duration, rotation },
          ]);
          
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
          }, duration * 1000 + 100);
        }
      }
    });
    prevReactionsRef.current = currentReactions;
  }, [reactionsData]);

  return (
    <div className="absolute inset-x-0 bottom-16 top-[60%] pointer-events-none z-[999] overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-0 animate-float-up opacity-0 pointer-events-none"
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
  );
}
