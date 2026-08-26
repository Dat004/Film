'use client';

import { Search, X, Loader2, Film as FilmIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';

import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import { pushRoute } from '@/lib/route-navigation';
import { cn } from '@/lib/utils';

import { useSearchAutocomplete } from '../../hooks/useSearchAutocomplete';
import { useRecentSearchStore } from '../../store/recent-search-store';
import type { Film } from '../../types/film.types';

import RecentSearches from './RecentSearches';
import SearchSuggestionItem from './SearchSuggestionItem';

export interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (keyword: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  className,
  placeholder = 'Nhập tên phim, diễn viên, từ khóa...',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const addRecentSearch = useRecentSearchStore((s) => s.addSearch);

  const handleSelectSuggestion = (film: Film) => {
    if (value.trim()) addRecentSearch(value.trim());
    if (film.name) addRecentSearch(film.name);
    pushRoute(router, `/phim/${film.slug}`);
  };

  const handleSelectKeyword = (keyword: string) => {
    onChange(keyword);
    addRecentSearch(keyword);
    onSubmit(keyword);
  };

  const { suggestions, isLoading, selectedIndex, isOpen, setIsOpen, handleKeyDown } =
    useSearchAutocomplete({
      keyword: value,
      limit: 6,
      onSelectSuggestion: handleSelectSuggestion,
      onSubmitSearch: (kw) => {
        addRecentSearch(kw);
        onSubmit(kw);
      },
    });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const showDropdown = isFocused && (isOpen || value.trim().length === 0);
  const listboxId = 'search-suggestions-listbox';

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            addRecentSearch(value.trim());
            onSubmit(value.trim());
            setIsOpen(false);
          }
        }}
      >
        <FlexContainer className="items-center py-[8px] bg-search-form rounded-[4px] px-[15px] clm:px-[12px] border border-solid border-bd-filed-form-color">
          <FlexItems className="flex-grow !flex-shrink">
            <FlexContainer className="relative items-center">
              <FlexItems className="!flex-grow-0">
                <i className="text-primary text-[20px] flex items-center">
                  <Search className="size-5 text-title" />
                </i>
              </FlexItems>
              <FlexItems className="w-[100%] !flex-shrink">
                <div className="clm:px-[12px] px-[15px]">
                  <input
                    ref={inputRef}
                    type="text"
                    name="search"
                    value={value}
                    onChange={(e) => {
                      if (e.target.value.startsWith(' ')) return;
                      onChange(e.target.value);
                    }}
                    onFocus={() => {
                      setIsFocused(true);
                      if (value.trim().length >= 2) {
                        setIsOpen(true);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    aria-controls={listboxId}
                    aria-activedescendant={
                      selectedIndex >= 0 ? `suggestion-item-${selectedIndex}` : undefined
                    }
                    className="w-[100%] text-[14px] text-primary bg-transparent placeholder:text-title outline-none"
                  />
                </div>
              </FlexItems>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="size-4 text-[var(--hover-color)] animate-spin" />
                ) : null}
                {value ? (
                  <Button
                    onClick={() => {
                      onChange('');
                      inputRef.current?.focus();
                    }}
                    type="button"
                    className="!p-1 text-title hover:text-primary transition-colors"
                    aria-label="Xóa từ khóa"
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </FlexContainer>
          </FlexItems>

          <FlexItems className="ml-[15px] clm:ml-[12px] !flex-grow-0 !flex-shrink-0">
            <Button
              aria-label="search-btn"
              type="submit"
              className="bg-bg-search-btn !text-primary text-[14px] px-[24px] kdm:px-[16px] kdm:py-[8px] rounded-[4px] py-[10px] hover:bg-bg-odd-color font-medium transition-colors"
            >
              Tìm kiếm
            </Button>
          </FlexItems>
        </FlexContainer>
      </form>

      {/* Visual Movie Grid Dropdown Panel */}
      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            'absolute left-0 right-0 top-[calc(100%+8px)] z-[1100] overflow-hidden rounded-[10px]',
            'border border-solid border-bd-filed-form-color bg-bg-sidebar shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {suggestions.length > 0 && isOpen ? (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-bd-filed-form-color">
                <span className="text-[13px] font-semibold text-primary flex items-center gap-2">
                  Gợi ý phim cho &quot;{value}&quot;
                </span>
                <span className="text-[11.5px] text-title font-medium">
                  {suggestions.length} phim phù hợp
                </span>
              </div>

              {/* Grid of Mini Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {suggestions.map((film, index) => (
                  <SearchSuggestionItem
                    key={film._id || film.slug || index}
                    id={`suggestion-item-${index}`}
                    film={film}
                    keyword={value}
                    isSelected={index === selectedIndex}
                    onSelect={handleSelectSuggestion}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {!isLoading && suggestions.length === 0 && value.trim().length >= 2 && isOpen ? (
            <div className="p-6 text-center text-sm text-title">
              Không tìm thấy phim phù hợp với từ khóa &quot;{value}&quot;
            </div>
          ) : null}

          {/* Recent searches display when input is empty or focused */}
          {value.trim().length < 2 && <RecentSearches onSelectKeyword={handleSelectKeyword} />}
        </div>
      )}
    </div>
  );
}

export default SearchAutocomplete;
