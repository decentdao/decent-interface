import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { MetaTransaction, FractalProposal, UsulProposal } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useUpdateProposalState from './useUpdateProposalState';

export default function useExecuteProposal() {
  const { t } = useTranslation('transaction');

  const { governanceContracts, action } = useFractal();
  const { usulContract } = governanceContracts;
  const { chainId } = useNetworkConfg();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
    chainId,
  });
  const [contractCallExecuteProposal, contractCallPending] = useTransaction();

  const executeProposal = useCallback(
    (proposal: FractalProposal) => {
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
          usulContract.asSigner.executeProposalBatch(
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
