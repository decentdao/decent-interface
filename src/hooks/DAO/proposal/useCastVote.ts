import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useTransaction } from '../../utils/useTransaction';

const useCastVote = ({
  proposalId,
  setPending,
}: {
  proposalId: BigNumber;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    governanceContracts: { ozLinearVotingContract },
  } = useFractal();

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    (vote: number) => {
      if (!proposalId || vote === undefined || !ozLinearVotingContract) {
        return;
      }

      contractCallCastVote({
        contractFn: () => ozLinearVotingContract.asSigner.vote(proposalId, vote),
        pendingMessage: t('pendingCastVote'),
        failedMessage: t('failedCastVote'),
        successMessage: t('successCastVote'),
      });
    },
    [contractCallCastVote, proposalId, t, ozLinearVotingContract]
  );
  return castVote;
};

export default useCastVote;
