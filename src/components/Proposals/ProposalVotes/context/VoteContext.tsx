import { abis } from '@fractal-framework/fractal-contracts';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getContract } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import useSnapshotProposal from '../../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import useUserERC721VotingTokens from '../../../../hooks/DAO/proposal/useUserERC721VotingTokens';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import {
  AzoriusProposal,
  ExtendedSnapshotProposal,
  FractalProposal,
  GovernanceType,
  MultisigProposal,
  SnapshotProposal,
} from '../../../../types';

interface IVoteContext {
  canVote: boolean;
  canVoteLoading: boolean;
  hasVoted: boolean;
  hasVotedLoading: boolean;
  getCanVote: (refetchUserTokens?: boolean) => Promise<void>;
  getHasVoted: () => void;
}

const VoteContext = createContext<IVoteContext>({
  canVote: false,
  canVoteLoading: false,
  hasVoted: false,
  hasVotedLoading: false,
  getCanVote: async () => {},
  getHasVoted: () => {},
});

export const useVoteContext = () => {
  const voteContext = useContext(VoteContext);
  return voteContext;
};

export function VoteContextProvider({
  proposal,
  children,
  extendedSnapshotProposal,
}: {
  proposal: FractalProposal;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
  children: ReactNode;
}) {
  const [canVote, setCanVote] = useState(false);
  const [canVoteLoading, setCanVoteLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasVotedLoading, setHasVotedLoading] = useState(false);
  const [proposalVotesLength, setProposalVotesLength] = useState(0);
  const {
    readOnly: { user },
    governance: { type, isAzorius },
  } = useFractal();
  const userAccount = useAccount();
  const { safe } = useDaoInfoStore();
  const { loadVotingWeight } = useSnapshotProposal(proposal as SnapshotProposal);
  const { remainingTokenIds, getUserERC721VotingTokens } = useUserERC721VotingTokens(
    null,
    proposal.proposalId,
    true,
  );
  const { snapshotProposal } = useSnapshotProposal(proposal);
  const publicClient = usePublicClient();

  const getHasVoted = useCallback(() => {
    setHasVotedLoading(true);
    if (snapshotProposal) {
      setHasVoted(
        !!extendedSnapshotProposal &&
          !!extendedSnapshotProposal.votes.find(vote => vote.voter === userAccount.address),
      );
    } else if (isAzorius) {
      const azoriusProposal = proposal as AzoriusProposal;
      if (azoriusProposal?.votes) {
        setHasVoted(!!azoriusProposal?.votes.find(vote => vote.voter === userAccount.address));
      }
    } else {
      const safeProposal = proposal as MultisigProposal;
      setHasVoted(
        !!safeProposal.confirmations?.find(
          confirmation => confirmation.owner === userAccount.address,
        ),
      );
    }
    setHasVotedLoading(false);
  }, [isAzorius, snapshotProposal, proposal, userAccount.address, extendedSnapshotProposal]);

  const getCanVote = useCallback(
    async (refetchUserTokens?: boolean) => {
      setCanVoteLoading(true);
      let newCanVote = false;
      if (userAccount.address && publicClient) {
        if (snapshotProposal) {
          const votingWeightData = await loadVotingWeight();
          newCanVote = votingWeightData.votingWeight >= 1;
        } else if (type === GovernanceType.AZORIUS_ERC20) {
          const azoriusProposal = proposal as AzoriusProposal;
          const ozLinearVotingContract = getContract({
            abi: abis.LinearERC20Voting,
            address: azoriusProposal.votingStrategy,
            client: publicClient,
          });
          newCanVote =
            (await ozLinearVotingContract.read.getVotingWeight([
              userAccount.address,
              Number(proposal.proposalId),
            ])) > 0n && !hasVoted;
        } else if (type === GovernanceType.AZORIUS_ERC721) {
          if (refetchUserTokens) {
            await getUserERC721VotingTokens(null, null);
          }
          newCanVote = user.votingWeight > 0 && remainingTokenIds.length > 0;
        } else if (type === GovernanceType.MULTISIG) {
          newCanVote = !!safe?.owners.includes(userAccount.address);
        } else {
          newCanVote = false;
        }
      }

      if (canVote !== newCanVote) {
        setCanVote(newCanVote);
      }
      setCanVoteLoading(false);
    },
    [
      userAccount.address,
      user.votingWeight,
      publicClient,
      canVote,
      snapshotProposal,
      type,
      loadVotingWeight,
      hasVoted,
      remainingTokenIds.length,
      getUserERC721VotingTokens,
      safe?.owners,
      proposal,
    ],
  );

  const initialLoadRef = useRef(false);
  useEffect(() => {
    // Prevent running this effect multiple times
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    getCanVote();
    getHasVoted();
  }, [getCanVote, getHasVoted]);

  useEffect(() => {
    const azoriusProposal = proposal as AzoriusProposal;
    if (azoriusProposal.votes && proposalVotesLength !== azoriusProposal.votes.length) {
      setProposalVotesLength(azoriusProposal.votes.length);
    }
  }, [proposal, proposalVotesLength]);

  return (
    <VoteContext.Provider
      value={{
        canVote,
        canVoteLoading,
        hasVoted,
        hasVotedLoading,
        getHasVoted,
        getCanVote,
      }}
    >
      {children}
    </VoteContext.Provider>
  );
}
