import { formatDistance } from 'date-fns';
import { useCallback } from 'react';
export const useTimeHelpers = () => {
  const getTimeDuration = useCallback(
    (_seconds: number | string | null | undefined): string | undefined => {
      if (!_seconds) return;
      return formatDistance(0, Number(_seconds) * 1000, { includeSeconds: true });
    },
    []
  );
  return { getTimeDuration };
};
