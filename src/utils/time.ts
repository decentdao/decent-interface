export const getTimestampString = (time: Date | undefined) => {
  if (time === undefined) return '...';

  return (
    time.toLocaleDateString('en-US', { month: 'short' }) +
    ' ' +
    time.toLocaleDateString('en-US', { day: 'numeric' }) +
    ', ' +
    time.toLocaleDateString('en-US', { year: 'numeric' })
  );
};
