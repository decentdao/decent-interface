import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalExecuteData } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';

export default function useRemoveProposalTemplate() {
  const { keyValuePairsContract } = useSafeContracts();
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();

  const prepareRemoveProposalTemplateProposal = useCallback(
    async (templateIndex: number) => {
      if (proposalTemplates) {
        const proposalMetadata = {
          title: 'Remove Proposal Template',
          description:
            'Execution of this proposal will remove proposal template, attached to this DAO.',
          documentationUrl: '',
        };

        const updatedTemplatesList = proposalTemplates.filter(
          (_, index: number) => index !== templateIndex
        );

        const { cid } = await client.add(JSON.stringify(updatedTemplatesList));

        const proposal: ProposalExecuteData = {
          ...proposalMetadata,
          targets: [keyValuePairsContract.asProvider.address],
          values: [BigNumber.from(0)],
          calldatas: [
            keyValuePairsContract.asProvider.interface.encodeFunctionData('updateValues', [
              ['proposalTemplates'],
              [`${cid}`], // Force conversion to string
            ]),
          ],
        };

        return proposal;
      }
    },
    [proposalTemplates, keyValuePairsContract, client]
  );

  return { prepareRemoveProposalTemplateProposal };
}
