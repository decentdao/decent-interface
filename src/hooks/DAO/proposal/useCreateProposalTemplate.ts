import { BigNumber, utils } from 'ethers';
import { create } from 'ipfs-http-client';
import { useCallback } from 'react';
import { ProposalExecuteData } from '../../../types';
import { CreateProposalTemplateForm } from '../../../types/createProposalTemplate';

export default function useCreateProposalTemplate() {
  const prepareProposalTemplateProposal = useCallback(
    async (values: CreateProposalTemplateForm) => {
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

      const auth =
        'Basic ' +
        Buffer.from(
          `${process.env.NEXT_PUBLIC_INFURA_PROJECT_API_KEY}:${process.env.NEXT_PUBLIC_INFURA_PROJECT_API_SECRET}`
        ).toString('base64');

      const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth,
        },
      });
      const { cid } = await client.add(JSON.stringify([proposalTemplateData])); // TODO - When fetching proposal templates will be implemented - upload updated data and not completely new one

      const proposal: ProposalExecuteData = {
        ...proposalMetadata,
        targets: ['0x6533aB31297bF97a124F19aF46C98148153ff620'], // TODO - use KeyValuePairs contract from fractal-contracts
        values: [BigNumber.from(0)],
        calldatas: [
          new utils.Interface([
            'function updateValues(string[] _keys, string[] _values)',
          ]).encodeFunctionData('updateValues', [['proposalTemplates'], [`${cid}`]]), // Force conversion to string
        ],
      };

      return proposal;
    },
    []
  );

  return { prepareProposalTemplateProposal };
}
