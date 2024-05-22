import { useCallback } from 'react';
import { isHex, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalExecuteData } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';

export default function useRemoveProposalTemplate() {
  const keyValuePairsContract = useSafeContracts()?.keyValuePairsContract;
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();

  const prepareRemoveProposalTemplateProposal = useCallback(
    async (templateIndex: number) => {
      if (proposalTemplates && keyValuePairsContract) {
        const proposalMetadata = {
          title: 'removeProposalTemplateTitle',
          description: 'removeProposalTemplateDescription',
          documentationUrl: '',
        };

        const updatedTemplatesList = proposalTemplates.filter(
          (_, index: number) => index !== templateIndex,
        );

        const { Hash } = await client.add(JSON.stringify(updatedTemplatesList));

        const encodedUpdateValues = keyValuePairsContract.asProvider.interface.encodeFunctionData(
          'updateValues',
          [['proposalTemplates'], [Hash]],
        );
        if (!isHex(encodedUpdateValues)) {
          return;
        }
        const proposal: ProposalExecuteData = {
          metaData: proposalMetadata,
          targets: [getAddress(keyValuePairsContract.asProvider.address)],
          values: [0n],
          calldatas: [encodedUpdateValues],
        };

        return proposal;
      }
    },
    [proposalTemplates, keyValuePairsContract, client],
  );

  return { prepareRemoveProposalTemplateProposal };
}
