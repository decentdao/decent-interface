import { UsulVetoGuard } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { VetoGuardType } from '../../../providers/Fractal/types';
import { useTransaction } from '../../utils/useTransaction';

export default function useQueueProposal() {
  const { t } = useTranslation('transaction');

  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const [contractCallQueueProposal, contractCallPending] = useTransaction();
  const {
    gnosis: {
      guardContracts: { vetoGuardContract, vetoGuardType },
    },
    governance: {
      contracts: { ozLinearVotingContract },
    },
  } = useFractal();

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
        pendingMessage: t('pendingQueue'),
        failedMessage: t('failedQueue'),
        successMessage: t('successQueue'),
      });
    },
    [
      contractCallQueueProposal,
      signerOrProvider,
      t,
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
