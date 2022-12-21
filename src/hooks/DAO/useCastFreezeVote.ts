import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../../providers/Web3Data/transactions';

const useCastFreezeVote = ({
  vetoVotingContract,
  setPending,
}: {
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    contractCallCastFreeze({
      contractFn: () => vetoVotingContract.castFreezeVote(),
      pendingMessage: t('pendingCastFreezeVote'),
      failedMessage: t('failedCastFreezeVote'),
      successMessage: t('successCastFreezeVote'),
    });
  }, [contractCallCastFreeze, t, vetoVotingContract]);
  return castFreezeVote;
};

export default useCastFreezeVote;
