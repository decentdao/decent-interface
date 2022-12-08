import { formatUSD } from './numberFormats';

describe('USD formatting, numbers', () => {
  test('number 0', () => {
    expect(formatUSD(0)).toBe('$0');
  });
  test('number 0.1', () => {
    expect(formatUSD(0.1)).toBe('$0.10');
  });
  test('number 1', () => {
    expect(formatUSD(1)).toBe('$1');
  });
  test('number 1.2', () => {
    expect(formatUSD(1.2)).toBe('$1.20');
  });
  test('number 1.23', () => {
    expect(formatUSD(1.23)).toBe('$1.23');
  });
  test('number 1.234', () => {
    expect(formatUSD(1.234)).toBe('$1.23');
  });
  test('number 1.239', () => {
    expect(formatUSD(1.239)).toBe('$1.24');
  });
  test('number 1.004', () => {
    expect(formatUSD(1.004)).toBe('$1');
  });
  test('number 1.009', () => {
    expect(formatUSD(1.009)).toBe('$1.01');
  });
  test('number 1000', () => {
    expect(formatUSD(1000)).toBe('$1,000');
  });
  test('number 1000000', () => {
    expect(formatUSD(1000000)).toBe('$1,000,000');
  });
});

describe('USD formatting, strings', () => {
  test('string 0', () => {
    expect(formatUSD('0')).toBe('$0');
  });
  test('string 0.1', () => {
    expect(formatUSD('0.1')).toBe('$0.10');
  });
  test('string 1', () => {
    expect(formatUSD('1')).toBe('$1');
  });
  test('string 1.2', () => {
    expect(formatUSD('1.2')).toBe('$1.20');
  });
  test('string 1.23', () => {
    expect(formatUSD('1.23')).toBe('$1.23');
  });
  test('string 1.234', () => {
    expect(formatUSD('1.234')).toBe('$1.23');
  });
  test('string 1.239', () => {
    expect(formatUSD('1.239')).toBe('$1.24');
  });
  test('string 1.004', () => {
    expect(formatUSD('1.004')).toBe('$1');
  });
  test('string 1.009', () => {
    expect(formatUSD('1.009')).toBe('$1.01');
  });
  test('string 1000', () => {
    expect(formatUSD('1000')).toBe('$1,000');
  });
  test('string 1000000', () => {
    expect(formatUSD('1000000')).toBe('$1,000,000');
  });
});
