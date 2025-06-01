import React, { useRef, useCallback, forwardRef } from 'react';
import * as RadixPrimitive from '@radix-ui/react-primitive';

const FixedComponent = forwardRef<
  React.ElementRef<typeof RadixPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadixPrimitive.Root>
>(({ children, ...props }, forwardedRef) => {
  const internalRef = useRef<HTMLElement>(null);
  
  // Stable ref callback that doesn't change on every render
  const setRef = useCallback((node: HTMLElement | null) => {
    internalRef.current = node;
    
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [forwardedRef]);
  
  return (
    <RadixPrimitive.Root ref={setRef} {...props}>
      {children}
    </RadixPrimitive.Root>
  );
});

FixedComponent.displayName = 'FixedComponent';

export { FixedComponent };
