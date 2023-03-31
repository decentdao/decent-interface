import { BigNumber } from 'ethers';
import { CreateIntegrationTransaction } from '../../types/createIntegration';

export const DEFAULT_INTEGRATION_TRANSACTION: CreateIntegrationTransaction = {
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

export const DEFAULT_INTEGRATION = {
  integrationMetadata: DEFAULT_META_DATA,
  transactions: [DEFAULT_INTEGRATION_TRANSACTION],
};
