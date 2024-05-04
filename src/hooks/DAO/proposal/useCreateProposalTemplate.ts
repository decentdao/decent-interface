import { useCallback } from 'react';
import { isHex, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalExecuteData } from '../../../types';
import { CreateProposalForm } from '../../../types/proposalBuilder';
import { couldBeENS } from '../../../utils/url';
import useSafeContracts from '../../safe/useSafeContracts';

export default function useCreateProposalTemplate() {
  const keyValuePairsContract = useSafeContracts()?.keyValuePairsContract;
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();
  const publicClient = usePublicClient();

  const prepareProposalTemplateProposal = useCallback(
    async (values: CreateProposalForm) => {
      if (proposalTemplates && publicClient && keyValuePairsContract) {
        const proposalMetadata = {
          title: 'Create Proposal Template',
          description:
            'Execution of this proposal will create a new proposal template, attached to this Safe.',
          documentationUrl: '',
        };

        const proposalTemplateData = {
          title: values.proposalMetadata.title.trim(),
          description: values.proposalMetadata.description.trim(),
          transactions: await Promise.all(
            values.transactions.map(async tx => ({
              ...tx,
              targetAddress: couldBeENS(tx.targetAddress)
                ? await publicClient.getEnsAddress({ name: tx.targetAddress })
                : tx.targetAddress,
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
          ),
        };

        const updatedTemplatesList = [...proposalTemplates, proposalTemplateData];

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
    [proposalTemplates, keyValuePairsContract, client, publicClient],
  );

  return { prepareProposalTemplateProposal };
}
