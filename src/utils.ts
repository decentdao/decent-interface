/**
 * truncates string to desire total length using "..." as a seperator
 * 
 * @param stringToTruncate 
 * @param maxLength lengh of space available for text
 * @param atEnd if true truncating will happen at end
 * @returns 
 */
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
  const first = stringToTruncate.substring(0, Math.round(maxLength / 2));
  const second = stringToTruncate.substring(Math.round(stringToTruncate.length - Math.round(maxLength / 2)));
  return first + ' ... ' + second;
};