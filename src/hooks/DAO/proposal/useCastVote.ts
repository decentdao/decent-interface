import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceSelectionType } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';

const useCastVote = ({
  proposalId,
  setPending,
}: {
  proposalId?: BigNumber;
  setPending?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    governanceContracts: { ozLinearVotingContract },
    governance,
    readOnly: { user },
  } = useFractal();

  const [contractCallCastVote, contractCallPending] = useTransaction();
  const canDelegate = useMemo(() => {
    if (governance.type === GovernanceSelectionType.AZORIUS_ERC20) {
      // TODO ERC721 voting will need to be included here
      const azoriusGovernance = governance as AzoriusGovernance;
      return azoriusGovernance?.votesToken?.balance?.gt(0);
    }
    return false;
  }, [governance]);

  const canVote = useMemo(() => {
    return user.votingWeight.gt(0);
  }, [user]);

  useEffect(() => {
    if (setPending) {
      setPending(contractCallPending);
    }
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
  return { castVote, canDelegate, canVote };
};

export default useCastVote;
