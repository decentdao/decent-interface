import { useCallback } from 'react';
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
          title: 'Remove Proposal Template',
          description:
            'Execution of this proposal will remove proposal template, attached to this Safe.',
          documentationUrl: '',
        };

        const updatedTemplatesList = proposalTemplates.filter(
          (_, index: number) => index !== templateIndex,
        );

        const { Hash } = await client.add(JSON.stringify(updatedTemplatesList));

        const proposal: ProposalExecuteData = {
          metaData: proposalMetadata,
          targets: [keyValuePairsContract.asProvider.address],
          values: [0n],
          calldatas: [
            keyValuePairsContract.asProvider.interface.encodeFunctionData('updateValues', [
              ['proposalTemplates'],
              [Hash],
            ]),
          ],
        };

        return proposal;
      }
    },
    [proposalTemplates, keyValuePairsContract, client],
  );

  return { prepareRemoveProposalTemplateProposal };
}
