import { VotesToken } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../../providers/Web3Data/transactions';

const useDelegateVote = ({
  delegatee,
  votingTokenContract,
  setPending,
}: {
  delegatee: string | undefined;
  votingTokenContract: VotesToken | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallDelegateVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const delegateVote = useCallback(() => {
    if (votingTokenContract === undefined || delegatee === undefined) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => votingTokenContract.delegate(delegatee),
      pendingMessage: t('pendingDelegateVote'),
      failedMessage: t('failedDelegateVote'),
      successMessage: t('successDelegateVote'),
    });
  }, [contractCallDelegateVote, votingTokenContract, delegatee, t]);

  return delegateVote;
};

export default useDelegateVote;
