import { OZLinearVoting__factory } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { useTransaction } from '../../../providers/Web3Data/transactions';
import useUsul from './useUsul';

export default function useQueueProposal() {
  const { t } = useTranslation('transaction');

  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const { votingStrategiesAddresses } = useUsul();
  const [contractCallQueueProposal, contractCallPending] = useTransaction();

  const queueProposal = useCallback(
    (proposalNumber: BigNumber) => {
      if (!signerOrProvider) {
        return;
      }
      const votingStrategyContract = OZLinearVoting__factory.connect(
        votingStrategiesAddresses[0],
        signerOrProvider
      );

      contractCallQueueProposal({
        contractFn: () => votingStrategyContract.finalizeStrategy(proposalNumber),
        pendingMessage: t('pendingQueue'),
        failedMessage: t('failedQueue'),
        successMessage: t('successQueue'),
      });
    },
    [contractCallQueueProposal, signerOrProvider, t, votingStrategiesAddresses]
  );

  return {
    pending: contractCallPending,
    queueProposal,
  };
}
