import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TxProposal, UsulProposal } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { useTransaction } from '../../../providers/Web3Data/transactions';
import { MetaTransaction } from '../../../types';
import useUsul from './useUsul';

export default function useExecuteProposal() {
  const { t } = useTranslation('transaction');

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const { usulContract } = useUsul();
  const [contractCallExecuteProposal, contractCallPending] = useTransaction();

  const executeProposal = useCallback(
    (proposal: TxProposal) => {
      const usulProposal = proposal as UsulProposal;
      if (
        !usulContract ||
        !signerOrProvider ||
        !usulProposal.metaData ||
        !usulProposal.metaData.transactions
      ) {
        return;
      }

      const targets: string[] = [];
      const values: MetaTransaction['value'][] = [];
      const data: string[] = [];
      const operations: number[] = [];

      usulProposal.metaData.transactions.forEach(tx => {
        targets.push(tx.to);
        values.push(tx.value);
        data.push(tx.data);
        operations.push(tx.operation);
      });

      contractCallExecuteProposal({
        contractFn: () =>
          usulContract.executeProposalBatch(
            proposal.proposalNumber,
            targets,
            values,
            data,
            operations
          ),
        pendingMessage: t('pendingExecute'),
        failedMessage: t('failedExecute'),
        successMessage: t('successExecute'),
      });
    },
    [contractCallExecuteProposal, signerOrProvider, t, usulContract]
  );

  return {
    pending: contractCallPending,
    executeProposal,
  };
}
