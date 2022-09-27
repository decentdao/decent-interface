function dateTimeFormatter(dateStart: Date, dateEnd: Date) {
  // Just for readability purpose - transform to minutes instead of miliseconds
  const diffInMinutes = Math.abs(dateEnd.getTime() - dateStart.getTime()) / (1000 * 60);
  const diffInDays = Math.floor(diffInMinutes / (60 * 24));
  const diffInMonths = Math.floor(diffInMinutes / (60 * 24 * 30));

  let formattedString = '';
  if (diffInMinutes < 5) {
    formattedString = '<5 minutes';
  } else if (diffInMinutes < 60) {
    formattedString = `${Math.floor(diffInMinutes)} minutes`;
  } else if (diffInMinutes < 60 * 24) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    formattedString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    formattedString = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInMonths < 12) {
    formattedString = `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
  } else {
    const diffInYears = Math.floor(diffInMonths / 12);
    formattedString = `${diffInYears} year${diffInYears > 1 ? 's' : ''}`;
  }

  return formattedString;
}

export default dateTimeFormatter;
