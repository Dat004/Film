'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import useDebounce from '@/hooks/useDebounce';

import { searchFilmService } from '../services/film.service';
import type { Film } from '../types/film.types';

export interface UseSearchAutocompleteProps {
  keyword: string;
  limit?: number;
  onSelectSuggestion?: (film: Film) => void;
  onSubmitSearch?: (keyword: string) => void;
}

export function useSearchAutocomplete({
  keyword,
  limit = 8,
  onSelectSuggestion,
  onSubmitSearch,
}: UseSearchAutocompleteProps) {
  const debouncedKeyword = useDebounce(keyword, 300);
  const [suggestions, setSuggestions] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch suggestions when debounced keyword changes
  useEffect(() => {
    const trimmed = debouncedKeyword.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // Cancel previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);

    searchFilmService({ keyword: trimmed, limit, page: 1 }, { signal: abortController.signal })
      .then((res) => {
        if (abortController.signal.aborted) return;
        const data = res.data as Record<string, unknown>;
        const items = (data?.data as Record<string, unknown>)?.items as Film[] | undefined;
        const resultItems = items ?? (data?.items as Film[]) ?? [];
        setSuggestions(resultItems);
        setIsLoading(false);
        setIsOpen(true);
        setSelectedIndex(-1);
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        setSuggestions([]);
        setIsLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [debouncedKeyword, limit]);

  // Keyboard navigation handler (combobox pattern)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) {
        if (e.key === 'Enter' && onSubmitSearch && keyword.trim()) {
          onSubmitSearch(keyword.trim());
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            const selected = suggestions[selectedIndex];
            if (selected) {
              onSelectSuggestion?.(selected);
              setIsOpen(false);
            }
          } else if (onSubmitSearch && keyword.trim()) {
            onSubmitSearch(keyword.trim());
            setIsOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, keyword, onSelectSuggestion, onSubmitSearch]
  );

  return {
    suggestions,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    handleKeyDown,
  };
}

export default useSearchAutocomplete;
