import { CreateProposalTemplateTransaction } from '../../types/createProposalTemplate';

export const DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION: CreateProposalTemplateTransaction = {
  targetAddress: '',
  ethValue: { value: '', bigintValue: undefined },
  functionName: '',
  parameters: [
    {
      signature: '',
      label: '',
      value: '',
    },
  ],
};

export const DEFAULT_PROPOSAL_TEMPLATE = {
  nonce: undefined,
  proposalTemplateMetadata: {
    title: '',
    description: '',
  },
  transactions: [DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION],
};
