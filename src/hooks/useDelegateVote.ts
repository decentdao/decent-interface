import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useGovenorModule } from '../providers/govenor/hooks/useGovenorModule';

const useDelegateVote = ({
  delegatee,
  successCallback,
}: {
  delegatee: string | undefined;
  successCallback: () => void;
}) => {
  const {
    votingToken: { votingTokenContract },
  } = useGovenorModule();
  const [contractCallDelegateVote, contractCallPending] = useTransaction();

  const { t } = useTranslation('transaction');

  let delegateVote = useCallback(() => {
    if (votingTokenContract === undefined || delegatee === undefined) {
      return;
    }

    contractCallDelegateVote({
      contractFn: () => votingTokenContract.delegate(delegatee),
      pendingMessage: t('pendingDelegateVote'),
      failedMessage: t('failedDelegateVote'),
      successMessage: t('successDelegateVote'),
      successCallback: () => successCallback(),
    });
  }, [contractCallDelegateVote, votingTokenContract, delegatee, successCallback, t]);

  return [delegateVote, contractCallPending] as const;
};

export default useDelegateVote;
