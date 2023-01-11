import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import { useTranslation } from 'react-i18next';

/**
 * Takes a Date parameter and returns a human readable string which is either a countdown time, or the
 * total elapsed time, depending on whether the reference date is in the future or past, respectively.
 *
 * @param referenceDate the point of reference (future or past), from which to calculate the time difference,
 * between then and now.
 * @returns a string formatted in the form "{difference} left" if the reference date is in the future,
 * or "{difference} ago" if the reference is in the past.
 */
export function useDateTimeDisplay(referenceDate: Date) {
  const now = new Date();
  const { t } = useTranslation();

  // Just for readability purpose - transform to minutes instead of milliseconds
  const diffInMinutes = Math.abs(differenceInMinutes(referenceDate, now));
  const diffInDays = Math.abs(differenceInDays(referenceDate, now));
  const diffInMonths = Math.abs(differenceInMonths(referenceDate, now));

  // if this is a future date, the display will be a countdown, e.g. "{time} left",
  // otherwise it will display as "{time} ago"
  const isCountdown = referenceDate.getTime() > now.getTime();

  let formattedString = '';
  if (diffInMinutes < 5) {
    formattedString = t(isCountdown ? 'labelNowishLeft' : 'labelNowishAgo', { ns: 'common' });
  } else if (diffInMinutes < 60) {
    formattedString = t(isCountdown ? 'labelMinutesLeft' : 'labelMinutesAgo', {
      count: Math.floor(diffInMinutes),
    });
  } else if (diffInMinutes < 60 * 24) {
    const diffInHours = Math.abs(differenceInHours(referenceDate, now));
    formattedString = t(isCountdown ? 'labelHoursLeft' : 'labelHoursAgo', {
      count: diffInHours,
    });
  } else if (diffInMonths < 1) {
    formattedString = t(isCountdown ? 'labelDaysLeft' : 'labelDaysAgo', {
      count: diffInDays,
    });
  } else if (diffInMonths < 12) {
    formattedString = t(isCountdown ? 'labelMonthsLeft' : 'labelMonthsAgo', {
      count: diffInMonths,
    });
  } else {
    const diffInYears = Math.abs(differenceInYears(referenceDate, now));
    formattedString = t(isCountdown ? 'labelYearsLeft' : 'labelYearsAgo', {
      count: diffInYears,
    });
  }

  return formattedString;
}
