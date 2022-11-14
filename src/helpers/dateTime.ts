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
    formattedString = t(diffInHours === 1 ? 'labelDateHour_single' : 'labelDateHour_plural', {
      count: diffInHours,
    });
  } else if (diffInMonths < 1) {
    formattedString = t(diffInDays === 1 ? 'labelDateDay_single' : 'labelDateDay_plural', {
      count: diffInDays,
    });
  } else if (diffInMonths < 12) {
    formattedString = t(diffInMonths === 1 ? 'labelDateMonth_single' : 'labelDateMonth_plural', {
      count: diffInMonths,
    });
  } else {
    const diffInYears = Math.abs(differenceInYears(dateStart, dateEnd));
    formattedString = t(diffInYears === 1 ? 'labelDateYear_single' : 'labelDateYear_plural', {
      count: diffInYears,
    });
  }

  return formattedString;
}
