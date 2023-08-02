import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoteContext } from '../../../components/Proposals/ProposalVotes/context/VoteContext';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceType, FractalProposal } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useAddressERC721VotingTokens from './useAddressERC721VotingTokens';

const useCastVote = ({
  proposal,
  setPending,
}: {
  proposal: FractalProposal;
  setPending?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    governanceContracts: { ozLinearVotingContract, erc721LinearVotingContract },
    governance,
    readOnly: { user },
  } = useFractal();

  const azoriusGovernance = useMemo(() => governance as AzoriusGovernance, [governance]);
  const { type } = azoriusGovernance;

  const [contractCallCastVote, contractCallPending] = useTransaction();

  const { remainingTokenIds, remainingTokenAddresses } = useAddressERC721VotingTokens(
    proposal.proposalId,
    user.address
  );
  const { getCanVote, getHasVoted } = useVoteContext();

  useEffect(() => {
    if (setPending) {
      setPending(contractCallPending);
    }
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    async (vote: number) => {
      let contractFn;
      if (type === GovernanceType.AZORIUS_ERC20 && ozLinearVotingContract) {
        contractFn = () => ozLinearVotingContract.asSigner.vote(proposal.proposalId, vote);
      } else if (type === GovernanceType.AZORIUS_ERC721 && erc721LinearVotingContract) {
        contractFn = () =>
          erc721LinearVotingContract.asSigner.vote(
            proposal.proposalId,
            vote,
            remainingTokenAddresses,
            remainingTokenIds
          );
      }

      if (contractFn) {
        contractCallCastVote({
          contractFn,
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getCanVote(true);
              getHasVoted();
            }, 3000);
          },
        });
      }
    },
    [
      contractCallCastVote,
      t,
      ozLinearVotingContract,
      erc721LinearVotingContract,
      type,
      proposal,
      remainingTokenAddresses,
      remainingTokenIds,
      getCanVote,
      getHasVoted,
    ]
  );
  return { castVote };
};

export default useCastVote;
