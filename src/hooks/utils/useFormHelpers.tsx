import { KeyboardEvent, useCallback } from 'react';

export const useFormHelpers = () => {
  const restrictChars = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (/^[eE\-\/+]$/.test(event.key)) {
      event.preventDefault();
    }
  }, []);

  return { restrictChars };
};
