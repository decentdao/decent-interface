import { BigNumber, utils } from 'ethers';
import * as IPFS from 'ipfs-core';
import { useCallback } from 'react';
import { ProposalExecuteData } from '../../../types';
import { CreateIntegrationForm } from '../../../types/createIntegration';

export default function useCreateIntegration() {
  const prepareIntegrationProposal = useCallback(async (values: CreateIntegrationForm) => {
    const proposalMetadata = {
      title: 'Create Integration',
      description:
        'Execution of this proposal will create a new integration, attached to this DAO.',
      documentationUrl: '',
    };
    const integrationData = {
      title: values.integrationMetadata.title,
      description: values.integrationMetadata.description,
      transactions: values.transactions,
    };
    const ipfs = await IPFS.create();
    const { cid } = await ipfs.add(JSON.stringify([integrationData])); // TODO - When fetching integrations will be implemented - upload

    const proposal: ProposalExecuteData = {
      ...proposalMetadata,
      targets: ['0x6533aB31297bF97a124F19aF46C98148153ff620'], // TODO - use KeyValuePairs contract from fractal-contracts
      values: [BigNumber.from(0)],
      calldatas: [
        new utils.Interface([
          'function updateValues(string[] _keys, string[] _values)',
        ]).encodeFunctionData('updateValues', [['integrations'], [`${cid}`]]), // Force conversion to string
      ],
    };

    return proposal;
  }, []);

  return { prepareIntegrationProposal };
}
