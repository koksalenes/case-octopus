import { useCallback, useEffect, useRef } from 'react';

export function useDebouncedCallback(
  callback: () => void,
  delay: number,
): () => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);
}
