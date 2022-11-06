import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import { TFunction } from 'react-i18next';

export function formatDatesDiffReadable(
  dateStart: Date,
  dateEnd: Date,
  t: TFunction<'translation', undefined>
) {
  // Just for readability purpose - transform to minutes instead of miliseconds
  const diffInMinutes = Math.abs(differenceInMinutes(dateStart, dateEnd));
  const diffInDays = Math.abs(differenceInDays(dateStart, dateEnd));
  const diffInMonths = Math.abs(differenceInMonths(dateStart, dateEnd));

  let formattedString = '';
  if (diffInMinutes < 5) {
    formattedString = t('labelDateJustNow');
  } else if (diffInMinutes < 60) {
    formattedString = t('labelDateMinutes', { count: Math.floor(diffInMinutes) });
  } else if (diffInMinutes < 60 * 24) {
    const diffInHours = Math.abs(differenceInHours(dateStart, dateEnd));
    formattedString = t('labelDateHour', { count: diffInHours });
  } else if (diffInMonths < 1) {
    formattedString = t('labelDateDay', { count: diffInDays });
  } else if (diffInMonths < 12) {
    formattedString = t('labelDateMonth', { count: diffInMonths });
  } else {
    const diffInYears = Math.abs(differenceInYears(dateStart, dateEnd));
    formattedString = t('labelDateYear', { count: diffInYears });
  }

  return formattedString;
}
