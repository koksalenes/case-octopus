import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not invoke the callback immediately', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    result.current();
    expect(callback).not.toHaveBeenCalled();
  });

  it('invokes the callback after the delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current();
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledOnce();
  });

  it('resets the timer on each call and only fires once for rapid calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    result.current();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    result.current();

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).toHaveBeenCalledOnce();
  });

  it('always calls the latest version of the callback', () => {
    const first = vi.fn();
    const second = vi.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, 300),
      {
        initialProps: { cb: first },
      },
    );

    result.current();
    rerender({ cb: second });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });

  it('returns a stable function reference across re-renders', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() =>
      useDebouncedCallback(callback, 300),
    );
    const ref1 = result.current;
    rerender();
    expect(result.current).toBe(ref1);
  });
});
