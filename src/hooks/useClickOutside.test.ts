import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useClickOutside } from './useClickOutside';

function makeRef<T extends HTMLElement>(element: T | null) {
  return { current: element };
}

describe('useClickOutside', () => {
  it('calls handler when click occurs outside the referenced element', () => {
    const handler = vi.fn();
    const inner = document.createElement('div');
    const outer = document.createElement('div');
    document.body.appendChild(outer);
    document.body.appendChild(inner);

    renderHook(() => useClickOutside(makeRef(inner), handler));

    act(() => {
      outer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledOnce();

    document.body.removeChild(inner);
    document.body.removeChild(outer);
  });

  it('does not call handler when click occurs inside the referenced element', () => {
    const handler = vi.fn();
    const container = document.createElement('div');
    const child = document.createElement('button');
    container.appendChild(child);
    document.body.appendChild(container);

    renderHook(() => useClickOutside(makeRef(container), handler));

    act(() => {
      child.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('does not call handler when click occurs on the element itself', () => {
    const handler = vi.fn();
    const el = document.createElement('div');
    document.body.appendChild(el);

    renderHook(() => useClickOutside(makeRef(el), handler));

    act(() => {
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(el);
  });

  it('calls handler on touchstart outside the element', () => {
    const handler = vi.fn();
    const inner = document.createElement('div');
    const outer = document.createElement('div');
    document.body.appendChild(inner);
    document.body.appendChild(outer);

    renderHook(() => useClickOutside(makeRef(inner), handler));

    act(() => {
      outer.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledOnce();

    document.body.removeChild(inner);
    document.body.removeChild(outer);
  });

  it('removes event listeners on unmount', () => {
    const handler = vi.fn();
    const inner = document.createElement('div');
    const outer = document.createElement('div');
    document.body.appendChild(inner);
    document.body.appendChild(outer);

    const { unmount } = renderHook(() =>
      useClickOutside(makeRef(inner), handler),
    );
    unmount();

    act(() => {
      outer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(inner);
    document.body.removeChild(outer);
  });

  it('does not throw when ref.current is null', () => {
    const handler = vi.fn();
    renderHook(() => useClickOutside(makeRef<HTMLDivElement>(null), handler));

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
