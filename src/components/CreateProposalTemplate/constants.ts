import { BigNumber } from 'ethers';
import { CreateProposalTemplateTransaction } from '../../types/createProposalTemplate';

export const DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION: CreateProposalTemplateTransaction = {
  targetAddress: '',
  ethValue: { value: '0', bigNumberValue: BigNumber.from('0') },
  functionName: '',
  parameters: [
    {
      signature: '',
      label: '',
      value: '',
    },
  ],
};

export const DEFAULT_META_DATA = {
  title: '',
  description: '',
};

export const DEFAULT_PROPOSAL_TEMPLATE = {
  proposalTemplateMetadata: DEFAULT_META_DATA,
  transactions: [DEFAULT_PROPOSAL_TEMPLATE_TRANSACTION],
};
