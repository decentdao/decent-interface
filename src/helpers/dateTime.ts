import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInHours from 'date-fns/differenceInHours';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInMonths from 'date-fns/differenceInMonths';
import differenceInYears from 'date-fns/differenceInYears';

export function formatDatesDiffReadable(dateStart: Date, dateEnd: Date) {
  // Just for readability purpose - transform to minutes instead of miliseconds
  const diffInMinutes = Math.abs(differenceInMinutes(dateStart, dateEnd));
  const diffInDays = Math.abs(differenceInDays(dateStart, dateEnd));
  const diffInMonths = Math.abs(differenceInMonths(dateStart, dateEnd));

  let formattedString = '';
  if (diffInMinutes < 5) {
    formattedString = '<5 minutes';
  } else if (diffInMinutes < 60) {
    formattedString = `${Math.floor(diffInMinutes)} minutes`;
  } else if (diffInMinutes < 60 * 24) {
    const diffInHours = Math.abs(differenceInHours(dateStart, dateEnd));
    formattedString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    formattedString = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInMonths < 12) {
    formattedString = `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
  } else {
    const diffInYears = Math.abs(differenceInYears(dateStart, dateEnd));
    formattedString = `${diffInYears} year${diffInYears > 1 ? 's' : ''}`;
  }

  return formattedString;
}
