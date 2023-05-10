import { ERC20FreezeVoting, MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../utils/useTransaction';

const useCastFreezeVote = ({
  freezeVotingContract,
  setPending,
}: {
  freezeVotingContract: ERC20FreezeVoting | MultisigFreezeVoting;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    contractCallCastFreeze({
      contractFn: () => freezeVotingContract.castFreezeVote(),
      pendingMessage: t('pendingCastFreezeVote'),
      failedMessage: t('failedCastFreezeVote'),
      successMessage: t('successCastFreezeVote'),
    });
  }, [contractCallCastFreeze, t, freezeVotingContract]);
  return castFreezeVote;
};

export default useCastFreezeVote;
