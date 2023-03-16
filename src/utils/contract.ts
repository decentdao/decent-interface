import { utils } from 'ethers';

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
    console.log('🚀 ~ file: contract.ts:18 ~ e:', e);
    return;
  }
};
