import { Contract, ethers } from 'ethers';
import { VotesToken } from '../../../assets/typechain-types/module-governor';
import { ProposalExecuteData } from '../../../types/proposal';

export interface GovernanceProposalData {
  createProposal?: (data: {
    proposalData: ProposalExecuteData;
    successCallback?: () => void;
  }) => void;
  governanceAddress?: string;
  treasuryModuleContract?: Contract;
  pending?: boolean;
  votingToken?: {
    votingTokenContract: VotesToken | undefined;
    votingTokenData: {
      name: string | undefined;
      symbol: string | undefined;
      decimals: number | undefined;
      userBalance: ethers.BigNumber | undefined;
      userClaimAmount: ethers.BigNumber | undefined;
      delegatee: string | undefined;
      votingWeight: ethers.BigNumber | undefined;
      address: string | undefined;
    };
  };
}
