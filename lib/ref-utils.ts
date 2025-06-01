import { useCallback, useRef } from 'react';

export function useStableRef<T>(callback?: (node: T | null) => void) {
  const ref = useRef<T>(null);
  
  const setRef = useCallback((node: T | null) => {
    ref.current = node;
    callback?.(node);
  }, [callback]);
  
  return [ref, setRef] as const;
}

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}
