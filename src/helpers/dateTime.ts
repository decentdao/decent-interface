import differenceInDays from 'date-fns/differenceInDays';
import differenceInHours from 'date-fns/differenceInHours';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';
import { TFunction } from 'react-i18next';

export function dateTimeDisplay(referenceDate: Date, t: TFunction<'translation', undefined>) {
  const now = new Date();

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
      ns: 'common',
      count: Math.floor(diffInMinutes),
    });
  } else if (diffInMinutes < 60 * 24) {
    const diffInHours = Math.abs(differenceInHours(referenceDate, now));
    formattedString = t(isCountdown ? 'labelHoursLeft' : 'labelHoursAgo', {
      count: diffInHours,
      ns: 'common',
    });
  } else if (diffInMonths < 1) {
    formattedString = t(isCountdown ? 'labelDaysLeft' : 'labelDaysAgo', {
      count: diffInDays,
      ns: 'common',
    });
  } else if (diffInMonths < 12) {
    formattedString = t(isCountdown ? 'labelMonthsLeft' : 'labelMonthsAgo', {
      count: diffInMonths,
      ns: 'common',
    });
  } else {
    const diffInYears = Math.abs(differenceInYears(referenceDate, now));
    formattedString = t(isCountdown ? 'labelYearsLeft' : 'labelYearsAgo', {
      count: diffInYears,
      ns: 'common',
    });
  }

  return formattedString;
}
