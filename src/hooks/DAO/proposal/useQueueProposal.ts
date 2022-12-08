import { OZLinearVoting__factory } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { useTransaction } from '../../../providers/Web3Data/transactions';
import useUsul from './useUsul';

export default function useQueueProposal() {
  const { t } = useTranslation('transaction');

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
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
