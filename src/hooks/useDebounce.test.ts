import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('does not update the value before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'initial' },
      },
    );

    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');
  });

  it('updates the value after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'initial' },
      },
    );

    rerender({ value: 'updated' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('debounces rapid successive changes and only applies the last value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'a' },
      },
    );

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: 'd' });

    // Still not updated
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('d');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      {
        initialProps: { value: 0 },
      },
    );

    rerender({ value: 42 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(42);
  });
});
