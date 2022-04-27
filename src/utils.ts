export const truncateString = (stringToTruncate: string, maxLength: number = 20, atEnd?: boolean) => {
  if (!stringToTruncate) {
    return '';
  }
  if (stringToTruncate.length <= maxLength + 3) {
    return stringToTruncate;
  }
  if (atEnd) {
    const slicedName = stringToTruncate.slice(0, maxLength);
    return slicedName + '...';
  }
  const first = stringToTruncate.substr(0, Math.round(maxLength / 2));
  const second = stringToTruncate.substr(Math.round(stringToTruncate.length - Math.round(maxLength / 2)));
  return first + ' ... ' + second;
};