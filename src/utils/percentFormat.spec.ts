import { BigNumber } from 'ethers';
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

describe('Percent formatting, BigNumber', () => {
  test('correct 100%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('1'))).toBe('100%');
  });
  test('correct 10%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('10'))).toBe('10%');
  });
  test('correct 1%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('100'))).toBe('1%');
  });
  test('correct 0.1%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('1000'))).toBe('0.1%');
  });
  test('correct 0.01%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('10000'))).toBe('0.01%');
  });
  test('correct 0.001%, number', () => {
    expect(formatPercentage(BigNumber.from('1'), BigNumber.from('100000'))).toBe('< 0.01%');
  });
  test('correct 1.1%, number', () => {
    expect(formatPercentage(BigNumber.from('10000000000'), BigNumber.from('909090909091'))).toBe(
      '1.1%'
    );
  });
  test('correct 1.01%, number', () => {
    expect(formatPercentage(BigNumber.from('10000000000'), BigNumber.from('990099009901'))).toBe(
      '1.01%'
    );
  });
  test('correct 1.001%, number', () => {
    expect(formatPercentage(BigNumber.from('10000000000'), BigNumber.from('999000999001'))).toBe(
      '1%'
    );
  });
});
