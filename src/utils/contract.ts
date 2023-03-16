import { utils } from 'ethers';

export const encodeFunction = (
  _functionName: string,
  _functionSignature: string,
  _parameters?: string
) => {
  const functionSignature = `function ${_functionName}(${_functionSignature})`;
  const parameters = !!_parameters ? _parameters.split(',').map(p => (p = p.trim())) : undefined;
  try {
    return new utils.Interface([functionSignature]).encodeFunctionData(_functionName, parameters);
  } catch (e) {
    return;
  }
};
