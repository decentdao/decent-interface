import { BigNumber, utils } from 'ethers';
import * as IPFS from 'ipfs-core';
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
        title: values.proposalTemplateMetadata.title,
        description: values.proposalTemplateMetadata.description,
        transactions: values.transactions,
      };
      const ipfs = await IPFS.create();
      const { cid } = await ipfs.add(JSON.stringify([proposalTemplateData])); // TODO - When fetching proposal templates will be implemented - upload updated data and not completely new one

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
