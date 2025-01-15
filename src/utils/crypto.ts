import { encodeFunctionData, parseAbiParameters } from 'viem';

function splitIgnoreBrackets(str: string): string[] {
  const result = str
    .match(/[^,\[\]]+|\[[^\]]*\]/g)!
    .filter(match => {
      return match.trim().length > 0;
    })
    .map(match => (match = match.trim()));
  return result;
}
/**
 * Encodes a smart contract function, given the provided function name, input types, and input values.
 *
 * @param _functionName the name of the smart contact function
 * @param _functionSignature the comma delimited input types and optionally their names, e.g. `uint256 amount, string note`
 * @param _parameters the actual values for the given _functionSignature
 * @returns the encoded function data, as a string
 */
export const encodeFunction = (
  _functionName: string,
  _functionSignature: string,
  _parameters: string,
) => {
  const parameters = !!_parameters
    ? splitIgnoreBrackets(_parameters).map(p => (p = p.trim()))
    : undefined;
  const parametersFixed: Array<string | string[]> | undefined = parameters ? [] : undefined;
  let tupleIndex: number | undefined = undefined;
  parameters?.forEach((param, i) => {
    if (param === '[]' || param === '[ ]') {
      // Handle empty array explicitly
      parametersFixed!!.push([]);
    } else if (param.startsWith('[') && param.endsWith(']')) {
      parametersFixed!!.push(
        param
          .substring(1, param.length - 1)
          .split(',')
          .map(p => (p = p.trim())),
      );
    } else if (param.startsWith('(')) {
      // This is part of tuple param, we need to re-assemble it. There should be better solution to this within splitIgnoreBrackets with regex.
      // However, we probably want to rebuild proposal builder to be more like ProposalTemplate builder
      tupleIndex = i;
      parametersFixed!!.push([param.replace('(', '')]);
    } else if (typeof tupleIndex === 'number' && !param.endsWith(')')) {
      (parametersFixed!![tupleIndex!] as string[]).push(param);
    } else if (param.endsWith(')')) {
      (parametersFixed!![tupleIndex!] as string[]).push(param.replace(')', ''));
      tupleIndex = undefined;
    } else if (
      (param.startsWith('"') && param.endsWith('"')) ||
      (param.startsWith("'") && param.endsWith("'"))
    ) {
      // Only remove outer quotes if the entire string is quoted
      return parametersFixed!!.push(param.substring(1, param.length - 1));
    } else {
      parametersFixed!!.push(param);
    }
  });
  const boolify = (parameter: string) => {
    if (['false'].includes(parameter.toLowerCase())) {
      return false;
    } else if (['true'].includes(parameter.toLowerCase())) {
      return true;
    } else {
      return parameter;
    }
  };
  const parametersFixedWithBool = parametersFixed?.map(parameter => {
    if (typeof parameter === 'string') {
      return boolify(parameter);
    } else if (Array.isArray(parameter)) {
      return parameter.map(innerParameter => {
        return boolify(innerParameter);
      });
    } else {
      throw new Error('parameter type not as expected');
    }
  });

  const abi = [
    {
      inputs: _functionSignature ? parseAbiParameters(_functionSignature) : [],
      name: _functionName,
      type: 'function',
    },
  ];

  const functionData = encodeFunctionData({
    args: parametersFixedWithBool,
    abi,
  });

  return functionData;
};
