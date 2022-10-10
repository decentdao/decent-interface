import { ProposalState } from '../providers/govenor/types';

const useProposalStateStringKey = (state: ProposalState | undefined) => {
  switch (state) {
    case ProposalState.Pending:
      return 'statePending';
    case ProposalState.Active:
      return 'stateActive';
    case ProposalState.Canceled:
      return 'stateCanceled';
    case ProposalState.Defeated:
      return 'stateRejected';
    case ProposalState.Succeeded:
      return 'stateSucceeded';
    case ProposalState.Queued:
      return 'stateQueued';
    case ProposalState.Expired:
      return 'stateExpired';
    case ProposalState.Executed:
      return 'stateExecuted';
    default:
      return 'stateUnknown';
  }
};

export default useProposalStateStringKey;
