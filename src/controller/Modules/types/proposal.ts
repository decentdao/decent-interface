import { ProposalExecuteData } from '../../../types/proposal';

export interface GovernanceProposalData {
  createProposal?: (data: {
    proposalData: ProposalExecuteData;
    successCallback?: () => void;
  }) => void;
  pending?: boolean;
  isAuthorized?: boolean;
}
