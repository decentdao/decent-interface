import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, getContract } from 'viem';
import { useWalletClient } from 'wagmi';
import { useVoteContext } from '../../../components/Proposals/ProposalVotes/context/VoteContext';
import { useFractal } from '../../../providers/App/AppProvider';
import { useTransaction } from '../../utils/useTransaction';
import useUserERC721VotingTokens from './useUserERC721VotingTokens';

const useCastVote = (proposalId: string, strategy: Address) => {
  const {
    governanceContracts: {
      linearVotingErc20Address,
      linearVotingErc20WithHatsWhitelistingAddress,
      linearVotingErc721Address,
      linearVotingErc721WithHatsWhitelistingAddress,
    },
  } = useFractal();

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
      if (!walletClient) {
        return;
      }

      if (
        strategy === linearVotingErc20Address ||
        strategy === linearVotingErc20WithHatsWhitelistingAddress
      ) {
        const ozLinearVotingContract = getContract({
          abi: abis.LinearERC20Voting,
          address: strategy,
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
              getCanVote();
            }, 3000);
          },
        });
      } else if (
        strategy === linearVotingErc721Address ||
        strategy === linearVotingErc721WithHatsWhitelistingAddress
      ) {
        const erc721LinearVotingContract = getContract({
          abi: abis.LinearERC721Voting,
          address: strategy,
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
              getCanVote();
            }, 3000);
          },
        });
      }
    },
    [
      contractCall,
      linearVotingErc721Address,
      linearVotingErc721WithHatsWhitelistingAddress,
      getCanVote,
      getHasVoted,
      linearVotingErc20Address,
      linearVotingErc20WithHatsWhitelistingAddress,
      proposalId,
      remainingTokenAddresses,
      remainingTokenIds,
      t,
      walletClient,
      strategy,
    ],
  );

  return {
    castVote,
    castVotePending: pending,
  };
};

export default useCastVote;
