import { formatDistance } from 'date-fns';
import { useCallback } from 'react';
export const useTimeHelpers = () => {
  const getTimeDuration = useCallback((_seconds: number | null | undefined): string | undefined => {
    if (!_seconds) return;
    return formatDistance(0, _seconds * 1000, { includeSeconds: true });
  }, []);
  return { getTimeDuration };
};
