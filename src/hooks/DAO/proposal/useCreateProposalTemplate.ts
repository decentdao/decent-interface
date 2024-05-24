import { useCallback } from 'react';
import { isHex, getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalExecuteData } from '../../../types';
import { CreateProposalForm } from '../../../types/proposalBuilder';
import { validateENSName } from '../../../utils/url';
import useSafeContracts from '../../safe/useSafeContracts';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export default function useCreateProposalTemplate() {
  const signerOrProvider = useSignerOrProvider();

  const keyValuePairsContract = useSafeContracts()?.keyValuePairsContract;
  const client = useIPFSClient();
  const {
    governance: { proposalTemplates },
  } = useFractal();

  const prepareProposalTemplateProposal = useCallback(
    async (values: CreateProposalForm) => {
      if (proposalTemplates && signerOrProvider && keyValuePairsContract) {
        const proposalMetadata = {
          title: 'createProposalTemplateTitle',
          description: 'createProposalTemplateDescription',
          documentationUrl: '',
        };

        const proposalTemplateData = {
          title: values.proposalMetadata.title.trim(),
          description: values.proposalMetadata.description.trim(),
          transactions: await Promise.all(
            values.transactions.map(async tx => ({
              ...tx,
              targetAddress: validateENSName(tx.targetAddress)
                ? await signerOrProvider.resolveName(tx.targetAddress)
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
    [proposalTemplates, keyValuePairsContract, client, signerOrProvider],
  );

  return { prepareProposalTemplateProposal };
}
