import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceModuleType } from '../../../types';
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
    node: { safe },
  } = useFractal();
  const { address: account } = useAccount();

  const [contractCallCastVote, contractCallPending] = useTransaction();
  const canVote = useMemo(() => {
    if (safe && account) {
      if (governance.type === GovernanceModuleType.MULTISIG) {
        return safe.owners.includes(account);
      } else if (governance.type === GovernanceModuleType.AZORIUS) {
        const azoriusGovernance = governance as AzoriusGovernance;
        if (azoriusGovernance.votesToken && azoriusGovernance.votesToken.balance) {
          return azoriusGovernance.votesToken.balance.gt(0);
        }
      }
    }
    return false;
  }, [account, governance, safe]);

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
  return { castVote, canVote };
};

export default useCastVote;
