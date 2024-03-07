import { formatDistance } from 'date-fns';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateFNSLocale } from '../../i18n';
export const useTimeHelpers = () => {
  const locale = useDateFNSLocale();
  const { t } = useTranslation('proposal');
  const getTimeDuration = useCallback(
    (_seconds: number | string | null | undefined): string | undefined => {
      if (_seconds === null || _seconds === undefined) return;
      if (Number(_seconds) === 0) return t('noTimeDifference');
      return formatDistance(0, Number(_seconds) * 1000, { includeSeconds: true, locale: locale });
    },
    [locale, t],
  );
  return { getTimeDuration };
};
