import { utils } from 'ethers';
import { logError } from '../helpers/errorLogging';
import { ActivityTransactionType } from '../types';

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
  _functionSignature?: string,
  _parameters?: string,
) => {
  let functionSignature = `function ${_functionName}`;
  if (_functionSignature) {
    functionSignature = functionSignature.concat(`(${_functionSignature})`);
  } else {
    functionSignature = functionSignature.concat('()');
  }

  const parameters = !!_parameters
    ? splitIgnoreBrackets(_parameters).map(p => (p = p.trim()))
    : undefined;

  const parametersFixed: Array<string | string[]> | undefined = parameters ? [] : undefined;
  let tupleIndex: number | undefined = undefined;
  parameters?.forEach((param, i) => {
    if (param.startsWith('[') && param.endsWith(']')) {
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

  try {
    return new utils.Interface([functionSignature]).encodeFunctionData(
      _functionName,
      parametersFixedWithBool,
    );
  } catch (e) {
    logError(e);
    return;
  }
};

export const encodeProposalTransaction = (
  target: string,
  functionName: string,
  signature: string,
  data: any,
  metaData: { title: string; description: string; documentationUrl?: string },
) => {
  const calldata = new utils.Interface([signature]).encodeFunctionData(functionName, data);
  const stringifiedMetadata = JSON.stringify(metaData);
  return {
    transaction: { to: target, value: 0, data: calldata, operation: 0 },
    metaData: stringifiedMetadata,
  };
};

const target = '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'; // SablierV2LockupDynamic
const functionName = 'createWithMilestones';
const signature =
  'function createWithMilestones(address,address,(address,uint40,bool,bool,address,uint128,(address,uint256),(uint128,uint64,uint40)[])[])';
const data = [
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
];

const metaData = {
  title: 'Sablier proposal',
  description: 'Sablier proposal description. Markdown supported!',
  documentationUrl: '',
};

console.log(encodeProposalTransaction(target, functionName, signature, data, metaData));

export function isMultiSigTx(transaction: ActivityTransactionType): boolean {
  return transaction.txType === 'MULTISIG_TRANSACTION';
}

export function isModuleTx(transaction: ActivityTransactionType): boolean {
  return transaction.txType === 'MODULE_TRANSACTION';
}
