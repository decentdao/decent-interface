import { utils } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { logError } from '../helpers/errorLogging';

export const isSameAddress = (addr1: string, addr2: string) => {
  if (!isAddress(addr1) || !isAddress(addr2)) {
    return false;
  }
  return addr1.toLowerCase() === addr2.toLowerCase();
};

export const encodeFunction = (
  _functionName: string,
  _functionSignature?: string,
  _parameters?: string
) => {
  let functionSignature = `function ${_functionName}`;
  if (_functionSignature) {
    functionSignature = functionSignature.concat(`(${_functionSignature})`);
  } else {
    functionSignature = functionSignature.concat('()');
  }
  const parameters = !!_parameters ? _parameters.split(',').map(p => (p = p.trim())) : undefined;
  try {
    return new utils.Interface([functionSignature]).encodeFunctionData(_functionName, parameters);
  } catch (e) {
    logError(e);
    return;
  }
};
