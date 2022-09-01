import { BigNumber, utils } from 'ethers';
import numeral, { Numeral } from 'numeral';

export function getRandomBytes() {
  const bytes8Array = new Uint8Array(32);
  self.crypto.getRandomValues(bytes8Array);
  const bytes32 = '0x' + bytes8Array.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '');
  return bytes32;
}

export function formatStrToBigNumber(str: string, decimals: number = 18): BigNumber {
  return utils.parseUnits(str, decimals);
}

export const makeNumeral = (bigNumber: BigNumber, decimals: number = 18): Numeral => {
  return numeral(utils.formatUnits(bigNumber, decimals));
};

export const getNumberalString = (
  bigNumber: BigNumber,
  decimals: number = 18,
  isFixed?: boolean
) => {
  if (isFixed) return makeNumeral(bigNumber, decimals).value();
  return makeNumeral(bigNumber, decimals).input();
};
