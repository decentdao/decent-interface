import { formatDistance } from 'date-fns';
import { useCallback } from 'react';
import { useDateFNSLocale } from '../../i18n';
export const useTimeHelpers = () => {
  const locale = useDateFNSLocale();
  const getTimeDuration = useCallback(
    (_seconds: number | string | null | undefined): string | undefined => {
      if (!_seconds) return;
      return formatDistance(0, Number(_seconds) * 1000, { includeSeconds: true, locale: locale });
    },
    [locale]
  );
  return { getTimeDuration };
};
