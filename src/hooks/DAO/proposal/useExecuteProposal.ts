import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useUpdateProposalState from '../../../providers/Fractal/governance/hooks/useUpdateProposalState';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { TxProposal, UsulProposal } from '../../../providers/Fractal/types';
import { MetaTransaction } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useUsul from './useUsul';

export default function useExecuteProposal() {
  const { t } = useTranslation('transaction');

  const { usulContract } = useUsul();
  const {
    actions: { refreshSafeData },
    governance,
    dispatches: { governanceDispatch },
  } = useFractal();
  const updateProposalState = useUpdateProposalState({ governance, governanceDispatch });
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
        successCallback: () => {
          refreshSafeData();
          updateProposalState(BigNumber.from(proposal.proposalNumber));
        },
      });
    },
    [contractCallExecuteProposal, t, usulContract, updateProposalState, refreshSafeData]
  );

  return {
    pending: contractCallPending,
    executeProposal,
  };
}
