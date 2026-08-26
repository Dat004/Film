import type { ReactNode } from 'react';
import React from 'react';

/**
 * Splits text into non-matching parts and matching query parts.
 * Highlights matching query parts using brand accent text color (no harsh background boxes).
 * Uses String.prototype.indexOf (case-insensitive) to prevent ReDoS vulnerability.
 */
export function highlightText(text: string, query: string): ReactNode[] {
  if (!text) return [];
  if (!query || !query.trim()) return [text];

  const trimmedQuery = query.trim();
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery, lastIndex);

  while (matchIndex !== -1) {
    // Append preceding non-matching substring
    if (matchIndex > lastIndex) {
      nodes.push(text.substring(lastIndex, matchIndex));
    }

    // Append matching substring with brand accent text color
    const matchedText = text.substring(matchIndex, matchIndex + trimmedQuery.length);
    nodes.push(
      <span key={`hl-${matchIndex}`} className="text-[var(--hover-color)] font-bold">
        {matchedText}
      </span>
    );

    lastIndex = matchIndex + trimmedQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, lastIndex);
  }

  // Append remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}
