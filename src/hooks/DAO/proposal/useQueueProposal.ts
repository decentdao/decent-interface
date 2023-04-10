import { UsulVetoGuard } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { useFractal } from '../../../providers/App/AppProvider';
import { VetoGuardType } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useUpdateProposalState from './useUpdateProposalState';

export default function useQueueProposal() {
  const { t } = useTranslation('transaction');

  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const [contractCallQueueProposal, contractCallPending] = useTransaction();
  const {
    guardContracts: { vetoGuardContract, vetoGuardType },
    governanceContracts,
    action,
  } = useFractal();
  const { ozLinearVotingContract } = governanceContracts;

  const {
    network: { chainId },
  } = useProvider();
  const updateProposalState = useUpdateProposalState({
    governanceContracts,
    governanceDispatch: action.dispatch,
    chainId,
  });

  const queueProposal = useCallback(
    (proposalNumber: BigNumber) => {
      if (!signerOrProvider) {
        return;
      }

      const contractFunc =
        vetoGuardContract && vetoGuardType === VetoGuardType.USUL
          ? (vetoGuardContract.asSigner as UsulVetoGuard).queueProposal
          : ozLinearVotingContract!.asSigner.finalizeStrategy;

      contractCallQueueProposal({
        contractFn: () => contractFunc(proposalNumber),
        successCallback: async () => {
          await updateProposalState(proposalNumber);
        },
        pendingMessage: t('pendingQueue'),
        failedMessage: t('failedQueue'),
        successMessage: t('successQueue'),
      });
    },
    [
      contractCallQueueProposal,
      signerOrProvider,
      t,
      updateProposalState,
      ozLinearVotingContract,
      vetoGuardContract,
      vetoGuardType,
    ]
  );

  return {
    pending: contractCallPending,
    queueProposal,
  };
}
