import dateTimeFormatter from './dateTimeFormatter';

const fromDate = new Date('September 27, 2022 20:30:00');
function createDateWithMinutesDiff(minutes: number) {
  return new Date(fromDate.getTime() + minutes * 60000);
}

describe('Date Time formatter', () => {
  test('Returns correct formatting for time diff less than 5 minutes', () => {
    const toDate = createDateWithMinutesDiff(4);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('<5 minutes');
  });
  test('Returns correct formatting for time diff more than 5 minutes and less than 60 minutes', () => {
    const toDate = createDateWithMinutesDiff(59);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('59 minutes');
  });
  test('Returns correct formatting for time diff more or equal than 1 hour but less than 1 day', () => {
    const toDateOneHour = createDateWithMinutesDiff(60);
    expect(dateTimeFormatter(fromDate, toDateOneHour)).toBe('1 hour');
    const toDate = createDateWithMinutesDiff(60 * 15.5);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('15 hours');
  });
  test('Returns correct formatting for time diff more or equal than 1 day but less than 1 month', () => {
    const toDateOneDay = createDateWithMinutesDiff(60 * 24);
    expect(dateTimeFormatter(fromDate, toDateOneDay)).toBe('1 day');
    const toDate = createDateWithMinutesDiff(60 * 24 * 5.5);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('5 days');
  });
  test('Returns correct formatting for time diff more or equal than 1 month but less than 1 year', () => {
    const toDateOneMonth = createDateWithMinutesDiff(60 * 24 * 30);
    expect(dateTimeFormatter(fromDate, toDateOneMonth)).toBe('1 month');
    const toDate = createDateWithMinutesDiff(60 * 24 * 30 * 6.5);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('6 months');
  });
  test('Returns correct formatting for time diff more than or equal to 1 year', () => {
    const toDateOneYear = createDateWithMinutesDiff(60 * 24 * 30 * 12);
    expect(dateTimeFormatter(fromDate, toDateOneYear)).toBe('1 year');
    const toDate = createDateWithMinutesDiff(60 * 24 * 30 * 12 * 3);
    expect(dateTimeFormatter(fromDate, toDate)).toBe('3 years');
  });
  test('Returns correct formatting when dateStart is bigger than dateEnd', () => {
    const toDate = createDateWithMinutesDiff(4);
    expect(dateTimeFormatter(toDate, fromDate)).toBe('<5 minutes');
  });
});
