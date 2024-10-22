import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getContract } from 'viem';
import { useWalletClient } from 'wagmi';
import { useVoteContext } from '../../../components/Proposals/ProposalVotes/context/VoteContext';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, GovernanceType } from '../../../types';
import { useTransaction } from '../../utils/useTransaction';
import useUserERC721VotingTokens from './useUserERC721VotingTokens';

const useCastVote = (proposalId: string) => {
  const {
    governanceContracts: { linearVotingErc20Address, linearVotingErc721Address },
    governance,
  } = useFractal();

  const azoriusGovernance = useMemo(() => governance as AzoriusGovernance, [governance]);
  const { type } = azoriusGovernance;

  const [contractCall, pending] = useTransaction();

  const { remainingTokenIds, remainingTokenAddresses } = useUserERC721VotingTokens(
    null,
    proposalId,
  );

  const { getCanVote, getHasVoted } = useVoteContext();
  const { data: walletClient } = useWalletClient();

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    async (vote: number) => {
      if (type === GovernanceType.AZORIUS_ERC20 && linearVotingErc20Address && walletClient) {
        const ozLinearVotingContract = getContract({
          abi: abis.LinearERC20Voting,
          address: linearVotingErc20Address,
          client: walletClient,
        });
        contractCall({
          contractFn: () => ozLinearVotingContract.write.vote([Number(proposalId), vote]),
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getHasVoted();
              getCanVote(true);
            }, 3000);
          },
        });
      } else if (
        type === GovernanceType.AZORIUS_ERC721 &&
        linearVotingErc721Address &&
        walletClient
      ) {
        const erc721LinearVotingContract = getContract({
          abi: abis.LinearERC721Voting,
          address: linearVotingErc721Address,
          client: walletClient,
        });
        contractCall({
          contractFn: () =>
            erc721LinearVotingContract.write.vote([
              Number(proposalId),
              vote,
              remainingTokenAddresses,
              remainingTokenIds.map(i => BigInt(i)),
            ]),
          pendingMessage: t('pendingCastVote'),
          failedMessage: t('failedCastVote'),
          successMessage: t('successCastVote'),
          successCallback: () => {
            setTimeout(() => {
              getHasVoted();
              getCanVote(true);
            }, 3000);
          },
        });
      }
    },
    [
      contractCall,
      linearVotingErc721Address,
      getCanVote,
      getHasVoted,
      linearVotingErc20Address,
      proposalId,
      remainingTokenAddresses,
      remainingTokenIds,
      t,
      type,
      walletClient,
    ],
  );

  return {
    castVote,
    castVotePending: pending,
  };
};

export default useCastVote;
