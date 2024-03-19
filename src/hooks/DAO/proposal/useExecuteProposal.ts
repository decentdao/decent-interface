import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { MetaTransaction, FractalProposal, AzoriusProposal } from '../../../types';
import useSafeContracts from '../../safe/useSafeContracts';
import { useTransaction } from '../../utils/useTransaction';
import useUpdateProposalState from './useUpdateProposalState';

export default function useExecuteProposal() {
  const { t } = useTranslation('transaction');

  const { governanceContracts, action } = useFractal();
  const { azoriusContractAddress } = governanceContracts;
  const baseContracts = useSafeContracts();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
  });
  const [contractCallExecuteProposal, contractCallPending] = useTransaction();

  const executeProposal = useCallback(
    (proposal: FractalProposal) => {
      const azoriusProposal = proposal as AzoriusProposal;
      if (
        !azoriusContractAddress ||
        !azoriusProposal.data ||
        !azoriusProposal.data.transactions ||
        !baseContracts
      ) {
        return;
      }
      const azoriusContract =
        baseContracts.fractalAzoriusMasterCopyContract.asSigner.attach(azoriusContractAddress);

      const targets: string[] = [];
      const values: MetaTransaction['value'][] = [];
      const data: string[] = [];
      const operations: number[] = [];

      azoriusProposal.data.transactions.forEach(tx => {
        targets.push(tx.to);
        values.push(tx.value);
        data.push(tx.data);
        operations.push(tx.operation);
      });

      contractCallExecuteProposal({
        contractFn: () =>
          azoriusContract.executeProposal(proposal.proposalId, targets, values, data, operations),
        pendingMessage: t('pendingExecute'),
        failedMessage: t('failedExecute'),
        successMessage: t('successExecute'),
        successCallback: async () => {
          // @todo may need to re-add a loader here
          updateProposalState(BigNumber.from(proposal.proposalId));
        },
      });
    },
    [contractCallExecuteProposal, t, azoriusContractAddress, updateProposalState, baseContracts],
  );

  return {
    pending: contractCallPending,
    executeProposal,
  };
}
