import { gql } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import {
  ExtendedSnapshotProposal,
  FractalProposal,
  FractalProposalState,
  SnapshotProposal,
  SnapshotVote,
  SnapshotWeightedVotingChoice,
} from '../../../../types';
import client from './';

export default function useSnapshotProposal(proposal: FractalProposal | null | undefined) {
  const [extendedSnapshotProposal, setExtendedSnapshotProposal] =
    useState<ExtendedSnapshotProposal>();
  const {
    node: { daoSnapshotURL },
    readOnly: {
      user: { address },
    },
  } = useFractal();

  const snapshotProposal = proposal as SnapshotProposal;
  const isSnapshotProposal = useMemo(
    () => !!snapshotProposal?.snapshotProposalId,
    [snapshotProposal]
  );

  const getVoteWeight = useCallback(
    (vote: SnapshotVote) =>
      vote.votingWeight * vote.votingWeightByStrategy.reduce((prev, curr) => prev + curr, 0),
    []
  );

  const loadProposal = useCallback(async () => {
    if (snapshotProposal?.snapshotProposalId) {
      const proposalQueryResult = await client
        .query({
          query: gql`
          query ExtendedSnapshotProposal {
            proposal(id: "${snapshotProposal.snapshotProposalId}") {
              snapshot
              type
              quorum
              privacy
              strategies {
                name
                network
                params
              }
              plugins
              choices
              ipfs
            }
          }
        `,
        })
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
          }
        );

      const votesQueryResult = await client
        .query({
          query: gql`query SnapshotProposalVotes {
          votes(where: {proposal: "${snapshotProposal.snapshotProposalId}"}) {
            id
            voter
            vp
            vp_by_strategy
            vp_state
            created
            choice
          }
        }`,
        })
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
          votes: SnapshotVote[];
          total: number;
        };
      } = {};

      const { choices, type, privacy } = proposalQueryResult;

      if (type === 'weighted') {
        Object.keys(choices).forEach((choice: string) => {
          votesBreakdown[choice] = {
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
        votesQueryResult.forEach((vote: SnapshotVote) => {
          if (type === 'weighted') {
            const voteChoices = vote.choice as SnapshotWeightedVotingChoice;
            if (typeof voteChoices === 'number') {
              // Means vote casted for single option, and Snapshot API returns just just number then =/
              const voteChoice = voteChoices - 1;
              const existingChoiceType = votesBreakdown[voteChoice];
              if (existingChoiceType) {
                votesBreakdown[voteChoice] = {
                  total: existingChoiceType.total + getVoteWeight(vote),
                  votes: [...existingChoiceType.votes, vote],
                };
              } else {
                votesBreakdown[voteChoice] = {
                  total: getVoteWeight(vote),
                  votes: [vote],
                };
              }
            } else {
              Object.keys(voteChoices).forEach((choiceIndex: any) => {
                // In Snapshot API choices are indexed 1-based. The first choice has index 1.
                // https://docs.snapshot.org/tools/api#vote
                const voteChoice = choices[choiceIndex - 1];
                const existingChoiceType = votesBreakdown[voteChoice];
                if (existingChoiceType) {
                  votesBreakdown[voteChoice] = {
                    total: existingChoiceType.total + getVoteWeight(vote),
                    votes: [...existingChoiceType.votes, vote],
                  };
                } else {
                  votesBreakdown[voteChoice] = {
                    total: getVoteWeight(vote),
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
                total: existingChoiceType.total + getVoteWeight(vote),
                votes: [...existingChoiceType.votes, vote],
              };
            } else {
              votesBreakdown[choiceKey] = {
                total: getVoteWeight(vote),
                votes: [vote],
              };
            }
          }
        });
      }

      setExtendedSnapshotProposal({
        ...proposal,
        ...proposalQueryResult,
        votesBreakdown,
        votes: votesQueryResult,
      } as ExtendedSnapshotProposal);
    }
  }, [snapshotProposal?.snapshotProposalId, proposal, snapshotProposal?.state, getVoteWeight]);

  const loadVotingWeight = useCallback(async () => {
    const emptyVotingWeight = {
      votingWeight: 0,
      votingWeightByStrategy: [0],
      votingState: '',
    };
    if (snapshotProposal?.snapshotProposalId) {
      const queryResult = await client
        .query({
          query: gql`
      query UserVotingWeight {
          vp(
              voter: "${address}"
              space: "${daoSnapshotURL}"
              proposal: "${snapshotProposal.snapshotProposalId}"
          ) {
              vp
              vp_by_strategy
              vp_state
          }
      }`,
        })
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
  }, [address, daoSnapshotURL, snapshotProposal?.snapshotProposalId]);

  return {
    loadVotingWeight,
    loadProposal,
    getVoteWeight,
    snapshotProposal,
    isSnapshotProposal,
    extendedSnapshotProposal,
  };
}
