export const DEFAULT_TRANSACTION = {
  targetAddress: '',
  ethValue: { value: '0', bigintValue: 0n },
  functionName: '',
  functionSignature: '',
  parameters: '',
  encodedFunctionData: undefined,
};

export const DEFAULT_PROPOSAL = {
  proposalMetadata: {
    title: '',
    description: '',
    documentationUrl: '',
  },
  transactions: [DEFAULT_TRANSACTION],
  nonce: 0,
};
