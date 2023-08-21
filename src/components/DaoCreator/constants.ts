import { BigNumber } from 'ethers';
import {
  CreatorFormState,
  GovernanceType,
  TokenCreationType,
  VotingStrategyType,
} from '../../types';

export const DEFAULT_TOKEN_DECIMALS = 18;

export const initialState: CreatorFormState = {
  essentials: {
    daoName: '',
    governance: GovernanceType.MULTISIG,
    snapshotURL: '',
  },
  erc20Token: {
    tokenCreationType: TokenCreationType.NEW,
    tokenName: '',
    tokenSupply: {
      value: '',
    },
    tokenSymbol: '',
    tokenAllocations: [
      {
        address: '',
        amount: {
          value: '',
        },
      },
    ],
    tokenImportAddress: '',
    parentAllocationAmount: {
      value: '',
    },
  },
  erc721Token: {
    nfts: [
      {
        tokenAddress: '',
        tokenWeight: {
          value: '',
        },
      },
    ],
    quorumThreshold: {
      value: '10',
      bigNumberValue: BigNumber.from(10),
    },
  },
  /**
   * Time periods in CreatorState are denoted in MINUTES in the UI,
   * however they will be converted to BLOCKS before submitting to
   * the DAO creation transaction.
   *
   * See {@link useBuildDAOTx} for more info.
   */
  azorius: {
    quorumPercentage: {
      value: '4',
      bigNumberValue: BigNumber.from(4),
    },
    timelock: {
      value: '1440',
      bigNumberValue: BigNumber.from(1440),
    },
    votingPeriod: {
      value: '10080',
      bigNumberValue: BigNumber.from(10080),
    },
    executionPeriod: {
      value: '2880',
      bigNumberValue: BigNumber.from(2880),
    },
    votingStrategyType: VotingStrategyType.LINEAR_ERC20,
  },
  freeze: {
    executionPeriod: {
      value: '2880',
      bigNumberValue: BigNumber.from(2880),
    },
    timelockPeriod: {
      value: '1440',
      bigNumberValue: BigNumber.from(1440),
    },
    freezeVotesThreshold: {
      value: '1',
      bigNumberValue: BigNumber.from(1),
    },
    freezeProposalPeriod: {
      value: '10080',
      bigNumberValue: BigNumber.from(10080),
    },
    freezePeriod: {
      value: '10080',
      bigNumberValue: BigNumber.from(10080),
    },
  },
  multisig: {
    trustedAddresses: [''],
    signatureThreshold: 1,
    numOfSigners: 1,
    customNonce: 0,
  },
};
