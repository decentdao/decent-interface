import { MetaFactoryCreateDAOData } from './metaFactory';
import { TokenAllocation } from './tokenAllocation';

export type CreateDAOData = (
  data: {
    creator: string;
    daoName: string;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply: string;
    tokenAllocations: TokenAllocation[];
    proposalThreshold: string;
    quorum: string;
    executionDelay: string;
    lateQuorumExecution: string;
    voteStartDelay: string;
    votingPeriod: string;
    parentAllocationAmount?: string;
  },
  parentToken?: string
) =>
  | undefined
  | {
      calldata: MetaFactoryCreateDAOData;
      predictedTreasuryAddress: string;
      predictedDAOAddress: string;
    };
