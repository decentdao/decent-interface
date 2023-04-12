import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { useTransaction } from '../../utils/useTransaction';

const useCastVote = ({
  proposalNumber,
  setPending,
}: {
  proposalNumber: BigNumber;
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
      if (!proposalNumber || !vote === undefined || !ozLinearVotingContract) {
        return;
      }

      contractCallCastVote({
        contractFn: () => ozLinearVotingContract.asSigner.vote(proposalNumber, vote, '0x'),
        pendingMessage: t('pendingCastVote'),
        failedMessage: t('failedCastVote'),
        successMessage: t('successCastVote'),
      });
    },
    [contractCallCastVote, proposalNumber, t, ozLinearVotingContract]
  );
  return castVote;
};

export default useCastVote;
