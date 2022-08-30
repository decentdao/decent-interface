import { ProposalExecuteData } from '../../../types/proposal';
import { BigNumber } from 'ethers';

export interface GovernanceProposalData {
  createProposal?: (data: {
    proposalData: ProposalExecuteData;
    successCallback?: () => void;
  }) => void;
  pending?: boolean;
  isAuthorized?: boolean;
}

export interface ExecuteData {
  targets: string[];
  values: BigNumber[];
  calldatas: string[];
}
