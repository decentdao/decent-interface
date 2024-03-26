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

test('Function encoding with tuple', () => {
  const encoded = new utils.Interface([
    'function someFooWithTupleAndLargeNumbers((address,address,address,uint88,uint88,uint88,uint88,uint88,uint64,uint64,uint40,uint40,uint40,uint40,bool,bytes32),uint256,uint256,bytes32)',
  ]).encodeFunctionData('someFooWithTupleAndLargeNumbers', [
    [
      '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
      '0x7f63C82b83B9375c21efbEAd2010F003d7FAD746',
      '0xE19f640d1FC22FeAf12DbD86b52bEa8Ac7d43E41',
      0,
      0,
      '309485009821345068724781055',
      '309485009821345068724781055',
      '309485009821345068724781055',
      '990000000000000000',
      '10000000000000000',
      1708516800,
      1708905540,
      0,
      0,
      true,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
    '40000000000000000000000000',
    '1000000000000000000',
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  ]);
  expect(
    encodeFunction(
      'someFooWithTupleAndLargeNumbers',
      '(address,address,address,uint88,uint88,uint88,uint88,uint88,uint64,uint64,uint40,uint40,uint40,uint40,bool,bytes32),uint256,uint256,bytes32',
      '(0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9,0x7f63C82b83B9375c21efbEAd2010F003d7FAD746,0xE19f640d1FC22FeAf12DbD86b52bEa8Ac7d43E41,0,0,309485009821345068724781055,309485009821345068724781055,309485009821345068724781055,990000000000000000,10000000000000000,1708516800,1708905540,0,0,true,0x0000000000000000000000000000000000000000000000000000000000000000),40000000000000000000000000,1000000000000000000,0x1111111111111111111111111111111111111111111111111111111111111111',
    ),
  ).toEqual(encoded);
});

test('Function encoding of array of tuples with nested tuples', () => {
  const encoded = new utils.Interface([
    'function createWithMilestones(address,address,(address,uint40,bool,bool,address,uint128,(address,uint256),(uint128,uint64,uint40)[])[])',
  ]).encodeFunctionData('createWithMilestones', [
    '0x7CC7e125d83A581ff438608490Cc0f7bDff79127',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [
      [
        '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
        1711980240,
        true,
        false,
        '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
        25000000000,
        ['0x0000000000000000000000000000000000000000', 0],
        [
          [0, '1000000000000000000', 1714572239],
          [5000000000, '1000000000000000000', 1714572240],
          [0, '1000000000000000000', 1717250639],
          [5000000000, '1000000000000000000', 1717250640],
          [0, '1000000000000000000', 1719842639],
          [5000000000, '1000000000000000000', 1719842640],
          [0, '1000000000000000000', 1722521039],
          [5000000000, '1000000000000000000', 1722521040],
          [0, '1000000000000000000', 1725199439],
          [5000000000, '1000000000000000000', 1725199440],
        ],
      ],
    ],
  ]);

  expect(
    encodeFunction(
      'createWithMilestones',
      'address,address,(address,uint40,bool,bool,address,uint128,(address,uint256),(uint128,uint64,uint40)[])[]',
      '0x7CC7e125d83A581ff438608490Cc0f7bDff79127,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,[(0x36bD3044ab68f600f6d3e081056F34f2a58432c4, 1711980240, true, false, 0x36bD3044ab68f600f6d3e081056F34f2a58432c4, 25000000000, (0x0000000000000000000000000000000000000000, 0),[(0, 1000000000000000000, 1714572239),(5000000000, 1000000000000000000, 1714572240), (0, 1000000000000000000, 1717250639), (5000000000, 1000000000000000000, 1717250640), (0, 1000000000000000000, 1719842639), (5000000000, 1000000000000000000, 1719842640), (0, 1000000000000000000, 1722521039), (5000000000, 1000000000000000000, 1722521040), (0, 1000000000000000000, 1725199439), (5000000000, 1000000000000000000, 1725199440)])]',
    ),
  ).toEqual(encoded);
});

// TODO: This test cases would fail, which is known issue. We'll need to improve our implementation
test.skip('Function encoding with [string="true"]', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', ['true']);
  expect(encodeFunction('foo', 'string', 'true')).toEqual(encoded);
});

test.skip('Function encoding with [string="false"]', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', [
    'false',
  ]);
  expect(encodeFunction('foo', 'string', 'false')).toEqual(encoded);
});

test.skip('Function encoding with [string=""', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', ['']);
  expect(encodeFunction('foo', 'string', '')).toEqual(encoded);
});

test.skip('Function encoding with [string="hello, world"', () => {
  const encoded = new utils.Interface(['function foo(string)']).encodeFunctionData('foo', [
    'hello, world',
  ]);
  expect(encodeFunction('foo', 'string', 'hello, world')).toEqual(encoded);
});
