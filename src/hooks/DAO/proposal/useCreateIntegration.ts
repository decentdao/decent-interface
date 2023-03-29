import { useCallback } from 'react';
import { CreateIntegrationForm } from '../../../types/createIntegration';
import { usePrepareProposal } from './usePrepareProposal';

export default function useCreateIntegration() {
  const { prepareProposal } = usePrepareProposal();

  const prepareIntegrationProposal = useCallback(
    (values: CreateIntegrationForm) => {
      const proposalMetadata = {
        title: 'Create Integration',
        description:
          'Execution of this proposal will create a new integration, attached to this DAO.',
        documentationUrl: '',
      };
      // TODO - 1. Safe integration JSON to IPFS;
      // 2.In transactions array - put single transaction with the call to KeyValuePairs to store integrations URL
      const proposalData = prepareProposal({ proposalMetadata, transactions: [] });

      return proposalData;
    },
    [prepareProposal]
  );

  return { prepareIntegrationProposal };
}
