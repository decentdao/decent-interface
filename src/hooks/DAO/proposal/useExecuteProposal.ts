import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MetaTransaction, TxProposal, UsulProposal } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useUpdateProposalState from './useUpdateProposalState';
import useUsul from './useUsul';

export default function useExecuteProposal() {
  const { t } = useTranslation('transaction');

  const { usulContract } = useUsul();
  const { governanceContracts, dispatch } = useFractal();
  const { chainId } = useNetworkConfg();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: dispatch.governance,
    chainId,
  });
  const [contractCallExecuteProposal, contractCallPending] = useTransaction();

  const executeProposal = useCallback(
    (proposal: TxProposal) => {
      const usulProposal = proposal as UsulProposal;
      if (!usulContract || !usulProposal.metaData || !usulProposal.metaData.transactions) {
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
        successCallback: async () => {
          // @todo may need to re-add a loader here
          updateProposalState(BigNumber.from(proposal.proposalNumber));
        },
      });
    },
    [contractCallExecuteProposal, t, usulContract, updateProposalState]
  );

  return {
    pending: contractCallPending,
    executeProposal,
  };
}
