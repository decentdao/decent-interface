import { utils } from 'ethers';
import { expect, test } from 'vitest';
import { encodeFunction } from '../src/utils/crypto';

test('Function encoding with no parameters', () => {
  const encoded = new utils.Interface(['function foo()']).encodeFunctionData('foo');
  expect(encodeFunction('foo')).toEqual(encoded);
});

test('Function encoding with [boolean=true]', () => {
  const encoded = new utils.Interface(['function foo(bool)']).encodeFunctionData('foo', [true]);
  expect(encodeFunction('foo', 'bool', 'true')).toEqual(encoded);
});

test('Function encoding with [boolean=false]', () => {
  const encoded = new utils.Interface(['function foo(bool)']).encodeFunctionData('foo', [false]);
  expect(encodeFunction('foo', 'bool', 'false')).toEqual(encoded);
});

test('Function encoding with [uint=0]', () => {
  const encoded = new utils.Interface(['function foo(uint)']).encodeFunctionData('foo', [0]);
  expect(encodeFunction('foo', 'uint', '0')).toEqual(encoded);
});

test('Function encoding with [uint256=0]', () => {
  const encoded = new utils.Interface(['function foo(uint256)']).encodeFunctionData('foo', [0]);
  expect(encodeFunction('foo', 'uint256', '0')).toEqual(encoded);
});

test('Function encoding with [uint8=0]', () => {
  const encoded = new utils.Interface(['function foo(uint8)']).encodeFunctionData('foo', [0]);
  expect(encodeFunction('foo', 'uint8', '0')).toEqual(encoded);
});

test('Function encoding with [uint8=100]', () => {
  const encoded = new utils.Interface(['function foo(uint8)']).encodeFunctionData('foo', [100]);
  expect(encodeFunction('foo', 'uint8', '100')).toEqual(encoded);
});

test('Function encoding with [string="true"]', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', ['true']);
  expect(encodeFunction('foo', 'string', 'true')).toEqual(encoded);
});

test('Function encoding with [string="false"]', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', [
    'false',
  ]);
  expect(encodeFunction('foo', 'string', 'false')).toEqual(encoded);
});

test('Function encoding with [string=""', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', ['']);
  expect(encodeFunction('foo', 'string', '')).toEqual(encoded);
});

test('Function encoding with [string="hello, world"', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', [
    'hello, world',
  ]);
  expect(encodeFunction('foo', 'string', 'hello, world')).toEqual(encoded);
});
