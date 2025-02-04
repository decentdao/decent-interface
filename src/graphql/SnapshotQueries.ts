export const ExtendedSnapshotProposalQuery = `query ExtendedSnapshotProposal($snapshotProposalId: String!) {
  proposal(id: $snapshotProposalId) {
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
}`;

export const SnapshotProposalVotesQuery = `query SnapshotProposalVotes($snapshotProposalId: String!) {
  votes(where: { proposal: $snapshotProposalId }, first: 500) {
    id
    voter
    vp
    vp_by_strategy
    vp_state
    created
    choice
  }
}`;

export const UserVotingWeightQuery = `query UserVotingWeight($voter: String!, $space: String!, $proposal: String!) {
  vp(voter: $voter, space: $space, proposal: $proposal) {
    vp
    vp_by_strategy
    vp_state
  }
}`;

export const ProposalsQuery = `query Proposals($spaceIn: [String!]) {
  proposals(
    first: 50,
    where: {
      space_in: $spaceIn
    },
     orderBy: "created",
     orderDirection: desc
  ) {
    id
    title
    body
    choices
    start
    end
    snapshot
    state
    author
    space {
      id
      name
    }
  }
}`;
