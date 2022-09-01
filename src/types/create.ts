import { InputBN } from './../components/DaoCreator/provider/types/index';
import { BigNumber } from 'ethers';
import { MetaFactoryCreateDAOData } from './metaFactory';
import { TokenAllocation } from './tokenAllocation';

export type CreateDAOData = (
  data: {
    creator: string;
    daoName: string;
    tokenName: string;
    tokenSymbol: string;
    tokenSupply: InputBN;
    tokenAllocations: TokenAllocation[];
    proposalThreshold: BigNumber;
    quorum: BigNumber;
    executionDelay: BigNumber;
    lateQuorumExecution: BigNumber;
    voteStartDelay: BigNumber;
    votingPeriod: BigNumber;
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
