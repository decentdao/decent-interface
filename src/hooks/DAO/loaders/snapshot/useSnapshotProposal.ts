import { useCallback, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { createSnapshotSubgraphClient } from '../../../../graphql';
import {
  ExtendedSnapshotProposalQuery,
  SnapshotProposalVotesQuery,
  UserVotingWeightQuery,
} from '../../../../graphql/SnapshotQueries';
import { logError } from '../../../../helpers/errorLogging';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import {
  DecentSnapshotVote,
  ExtendedSnapshotProposal,
  FractalProposal,
  FractalProposalState,
  SnapshotProposal,
  SnapshotWeightedVotingChoice,
} from '../../../../types';

export default function useSnapshotProposal(proposal: FractalProposal | null | undefined) {
  const [extendedSnapshotProposal, setExtendedSnapshotProposal] =
    useState<ExtendedSnapshotProposal | null>(null);
  const { address } = useAccount();

  const { subgraphInfo } = useDaoInfoStore();
  const snaphshotGraphQlClient = useMemo(() => createSnapshotSubgraphClient(), []);

  const snapshotProposal = useMemo(() => {
    const possiblySnaphsotProposal = proposal as SnapshotProposal;
    if (!!possiblySnaphsotProposal?.snapshotProposalId) {
      return possiblySnaphsotProposal;
    }

    return null;
  }, [proposal]);

  const loadSnapshotProposal = useCallback(async () => {
    if (!!snapshotProposal && snaphshotGraphQlClient) {
      const proposalQueryResult = await snaphshotGraphQlClient
        .query(ExtendedSnapshotProposalQuery, {
          snapshotProposalId: snapshotProposal.snapshotProposalId,
        })
        .toPromise()
        .then(
          ({
            data: {
              proposal: { snapshot, strategies, plugins, choices, type, quorum, privacy, ipfs },
            },
          }) => {
            return {
              snapshot,
              strategies,
              plugins,
              choices,
              type,
              quorum,
              privacy,
              ipfs,
            };
          },
        );

      const votesQueryResult = await snaphshotGraphQlClient
        .query(SnapshotProposalVotesQuery, {
          snapshotProposalId: snapshotProposal.snapshotProposalId,
        })
        .toPromise()
        .then(({ data: { votes } }) => {
          return votes.map(({ id, voter, vp, vp_by_strategy, vp_state, created, choice }: any) => ({
            id,
            voter,
            votingWeight: vp,
            votingWeightByStrategy: vp_by_strategy,
            votingState: vp_state,
            created,
            choice,
          }));
        });

      const votesBreakdown: {
        [voteChoice: string]: {
          votes: DecentSnapshotVote[];
          total: number;
        };
      } = {};

      const { choices, type, privacy } = proposalQueryResult;

      if (type === 'weighted') {
        Object.keys(choices).forEach((_choice: string, choiceIndex) => {
          votesBreakdown[choiceIndex + 1] = {
            votes: [],
            total: 0,
          };
        });
      } else {
        choices.forEach((choice: string) => {
          votesBreakdown[choice] = {
            votes: [],
            total: 0,
          };
        });
      }

      const isShielded = privacy === 'shutter';
      const isClosed = snapshotProposal.state === FractalProposalState.CLOSED;

      if (!(isShielded && !isClosed)) {
        votesQueryResult.forEach((vote: DecentSnapshotVote) => {
          if (type === 'weighted') {
            const voteChoices = vote.choice as SnapshotWeightedVotingChoice;
            if (typeof voteChoices === 'number') {
              // Means vote casted for single option, and Snapshot API returns just number then =/
              const voteChoice = voteChoices - 1;
              const existingChoiceType = votesBreakdown[voteChoice];
              if (existingChoiceType) {
                votesBreakdown[voteChoice] = {
                  total: existingChoiceType.total + vote.votingWeight,
                  votes: [...existingChoiceType.votes, vote],
                };
              } else {
                votesBreakdown[voteChoice] = {
                  total: vote.votingWeight,
                  votes: [vote],
                };
              }
            } else {
              let totalVotingWeightDistributon = 0;
              Object.keys(voteChoices).forEach(
                (choice: any) => (totalVotingWeightDistributon += voteChoices[choice]),
              );
              Object.keys(voteChoices).forEach((choiceIndex: any) => {
                const voteChoiceValue = voteChoices[choiceIndex] / totalVotingWeightDistributon;
                const existingChoiceType = votesBreakdown[choiceIndex];

                if (existingChoiceType) {
                  votesBreakdown[choiceIndex] = {
                    total: existingChoiceType.total + vote.votingWeight * voteChoiceValue,
                    votes: [...existingChoiceType.votes, vote],
                  };
                } else {
                  votesBreakdown[choiceIndex] = {
                    total: vote.votingWeight * voteChoiceValue,
                    votes: [vote],
                  };
                }
              });
            }
          } else {
            const voteChoice = vote.choice as number;
            const choiceKey = choices[voteChoice - 1];
            const existingChoiceType = votesBreakdown[choiceKey];

            if (existingChoiceType) {
              votesBreakdown[choiceKey] = {
                total: existingChoiceType.total + vote.votingWeight,
                votes: [...existingChoiceType.votes, vote],
              };
            } else {
              votesBreakdown[choiceKey] = {
                total: vote.votingWeight,
                votes: [vote],
              };
            }
          }
        });
      }

      const extendedProposal: ExtendedSnapshotProposal = {
        ...snapshotProposal,
        ...proposalQueryResult,
        votesBreakdown,
        votes: votesQueryResult,
      };

      setExtendedSnapshotProposal(extendedProposal);
    }
  }, [snapshotProposal, snaphshotGraphQlClient]);

  const loadVotingWeight = useCallback(async () => {
    const emptyVotingWeight = {
      votingWeight: 0,
      votingWeightByStrategy: [0],
      votingState: '',
    };

    if (snapshotProposal?.snapshotProposalId && snaphshotGraphQlClient) {
      const queryResult = await snaphshotGraphQlClient
        .query(UserVotingWeightQuery, {
          voter: address,
          space: subgraphInfo?.daoSnapshotENS,
          proposal: snapshotProposal.snapshotProposalId,
        })
        .toPromise()
        .then(({ data: { vp } }) => {
          if (!vp) {
            logError('Error while retrieving Snapshot voting weight', vp);
            return emptyVotingWeight;
          }
          return {
            votingWeight: vp.vp,
            votingWeightByStrategy: vp.vp_by_strategy,
            votingState: vp.vp_state,
          };
        });

      return queryResult;
    }

    return emptyVotingWeight;
  }, [
    address,
    snapshotProposal?.snapshotProposalId,
    snaphshotGraphQlClient,
    subgraphInfo?.daoSnapshotENS,
  ]);

  return {
    loadVotingWeight,
    loadSnapshotProposal,
    snapshotProposal,
    extendedSnapshotProposal,
  };
}
