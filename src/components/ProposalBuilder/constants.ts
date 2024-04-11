import { CreateProposalTransaction } from '../../types/proposalBuilder';

export const DEFAULT_PROPOSAL_TRANSACTION: CreateProposalTransaction = {
  targetAddress: '',
  ethValue: { value: '', bigNumberValue: null },
  functionName: '',
  parameters: [
    {
      signature: '',
      label: '',
      value: '',
    },
  ],
};

export const DEFAULT_PROPOSAL = {
  nonce: undefined,
  proposalMetadata: {
    title: '',
    description: '',
  },
  transactions: [DEFAULT_PROPOSAL_TRANSACTION],
};
