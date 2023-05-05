import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalExecuteData } from '../../../types';
import { CreateProposalTemplateForm } from '../../../types/createProposalTemplate';
import useSafeContracts from '../../safe/useSafeContracts';

export default function useCreateProposalTemplate() {
  const { keyValuePairsContract } = useSafeContracts();
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();

  const prepareProposalTemplateProposal = useCallback(
    async (values: CreateProposalTemplateForm) => {
      if (proposalTemplates) {
        const proposalMetadata = {
          title: 'Create Proposal Template',
          description:
            'Execution of this proposal will create a new proposal template, attached to this DAO.',
          documentationUrl: '',
        };
        const proposalTemplateData = {
          title: values.proposalTemplateMetadata.title.trim(),
          description: values.proposalTemplateMetadata.description.trim(),
          transactions: values.transactions.map(tx => ({
            ...tx,
            parameters: tx.parameters
              .map(param => {
                if (param.signature) {
                  return param;
                } else {
                  // This allows submitting transaction function with no params
                  return undefined;
                }
              })
              .filter(param => param),
          })),
        };

        const updatedTemplatesList = [...proposalTemplates, proposalTemplateData];

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

  return { prepareProposalTemplateProposal };
}
