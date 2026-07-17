import { describe, it, expect } from 'vitest';

import { cn, formatDate, calcReadingTime, truncate, formatDuration, isObject } from '@/lib/utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
  });

  it('resolves Tailwind conflicts — last value wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('filters out falsy values', () => {
    expect(cn('base', false, undefined, null, 'extra')).toBe('base extra');
  });
});

describe('formatDate', () => {
  it('formats a date string to dd/MM/yyyy', () => {
    const result = formatDate('2024-01-15', 'vi-VN');
    expect(result).toBe('15/01/2024');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-01'), 'vi-VN');
    expect(result).toBe('01/06/2024');
  });
});

describe('calcReadingTime', () => {
  it('returns 1 minute for short content', () => {
    expect(calcReadingTime('word '.repeat(100))).toBe(1);
  });

  it('returns correct minutes for longer content', () => {
    expect(calcReadingTime('word '.repeat(400))).toBe(2);
  });

  it('rounds up fractions', () => {
    expect(calcReadingTime('word '.repeat(201))).toBe(2);
  });
});

describe('truncate', () => {
  it('returns the original string when shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('returns the original string when equal to maxLength', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis when over maxLength', () => {
    expect(truncate('hello world', 5)).toBe('hello…');
  });
});

describe('formatDuration', () => {
  it('formats seconds under an hour as mm:ss', () => {
    expect(formatDuration(90)).toBe('01:30');
  });

  it('formats seconds over an hour as h:mm:ss', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('00:00');
  });
});

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});
