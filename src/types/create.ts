import { BigNumber } from 'ethers';
import { MetaFactoryCreateDAOData } from './metaFactory';
import { TokenAllocation } from './tokenAllocation';

export type CreateDAOData = (
  data: {
    creator: string;
    daoName: string;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply: BigNumber;
    tokenAllocations: TokenAllocation[];
    proposalThreshold: BigNumber;
    quorum: BigNumber;
    executionDelay: string;
    lateQuorumExecution: string;
    voteStartDelay: string;
    votingPeriod: string;
    parentAllocationAmount?: BigNumber;
  },
  parentToken?: string
) =>
  | undefined
  | {
      calldata: MetaFactoryCreateDAOData;
      predictedTreasuryAddress: string;
      predictedDAOAddress: string;
    };
