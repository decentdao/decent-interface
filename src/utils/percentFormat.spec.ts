import { formatPercentage } from './numberFormats';

describe('Percent formatting, number', () => {
  test('correct 100%, number', () => {
    expect(formatPercentage(1, 1)).toBe('100%');
  });
  test('correct 10%, number', () => {
    expect(formatPercentage(1, 10)).toBe('10%');
  });
  test('correct 1%, number', () => {
    expect(formatPercentage(1, 100)).toBe('1%');
  });
  test('correct 0.1%, number', () => {
    expect(formatPercentage(1, 1000)).toBe('0.1%');
  });
  test('correct 0.01%, number', () => {
    expect(formatPercentage(1, 10000)).toBe('0.01%');
  });
  test('correct 0.001%, number', () => {
    expect(formatPercentage(1, 100000)).toBe('< 0.01%');
  });
  test('correct 1.1%, number', () => {
    expect(formatPercentage(1, 90.9090909091)).toBe('1.1%');
  });
  test('correct 1.01%, number', () => {
    expect(formatPercentage(1, 99.0099009901)).toBe('1.01%');
  });
  test('correct 1.001%, number', () => {
    expect(formatPercentage(1, 99.9000999001)).toBe('1%');
  });
});

describe('Percent formatting, string', () => {
  test('correct 100%, number', () => {
    expect(formatPercentage('1', '1')).toBe('100%');
  });
  test('correct 10%, number', () => {
    expect(formatPercentage('1', '10')).toBe('10%');
  });
  test('correct 1%, number', () => {
    expect(formatPercentage('1', '100')).toBe('1%');
  });
  test('correct 0.1%, number', () => {
    expect(formatPercentage('1', '1000')).toBe('0.1%');
  });
  test('correct 0.01%, number', () => {
    expect(formatPercentage('1', '10000')).toBe('0.01%');
  });
  test('correct 0.001%, number', () => {
    expect(formatPercentage('1', '100000')).toBe('< 0.01%');
  });
  test('correct 1.1%, number', () => {
    expect(formatPercentage('1', '90.9090909091')).toBe('1.1%');
  });
  test('correct 1.01%, number', () => {
    expect(formatPercentage('1', '99.0099009901')).toBe('1.01%');
  });
  test('correct 1.001%, number', () => {
    expect(formatPercentage('1', '99.9000999001')).toBe('1%');
  });
});

describe('Percent formatting, Bigint', () => {
  test('correct 100%, number', () => {
    expect(formatPercentage(1n, 1n)).toBe('100%');
  });
  test('correct 10%, number', () => {
    expect(formatPercentage(1n, 10n)).toBe('10%');
  });
  test('correct 1%, number', () => {
    expect(formatPercentage(1n, 100n)).toBe('1%');
  });
  test('correct 0.1%, number', () => {
    expect(formatPercentage(1n, 1000n)).toBe('0.1%');
  });
  test('correct 0.01%, number', () => {
    expect(formatPercentage(1n, 10000n)).toBe('0.01%');
  });
  test('correct 0.001%, number', () => {
    expect(formatPercentage(1n, 100000n)).toBe('< 0.01%');
  });
  test('correct 1.1%, number', () => {
    expect(formatPercentage(10000000000n, 909090909091n)).toBe('1.1%');
  });
  test('correct 1.01%, number', () => {
    expect(formatPercentage(10000000000n, 990099009901n)).toBe('1.01%');
  });
  test('correct 1.001%, number', () => {
    expect(formatPercentage(10000000000n, 999000999001n)).toBe('1%');
  });
});
