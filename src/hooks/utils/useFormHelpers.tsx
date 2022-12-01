import { KeyboardEvent, useCallback } from 'react';

// @todo this will be moved to design system in future release
export const useFormHelpers = () => {
  const restrictChars = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (/^[eE\-\/+]$/.test(event.key)) {
      event.preventDefault();
    }
  }, []);
  const limitDecimalsOnKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, value: string, maxDecimals: number) => {
      if (!value || !event.key.match('[0-9]')) {
        restrictChars(event);
        return event;
      }

      const [, dec] = value.toString().split('.');
      if (!!dec && !!maxDecimals && dec.length >= maxDecimals) {
        event.preventDefault();
      }
    },
    [restrictChars]
  );

  return { limitDecimalsOnKeyDown, restrictChars };
};
