import { GovernanceTypes } from '../../providers/Fractal/types';
import { CreatorSteps } from './types';

export const CREATOR_STEP_TITLE_KEYS = {
  [CreatorSteps.ESSENTIALS]: 'titleEssentials',
  [CreatorSteps.PURE_GNOSIS]: 'titleSafeConfig',
  [CreatorSteps.GNOSIS_WITH_USUL]: 'titleUsulConfig',
  [CreatorSteps.GNOSIS_GOVERNANCE]: 'titleGnosis',
  [CreatorSteps.GOV_CONFIG]: 'titleGovConfig',
  [CreatorSteps.GUARD_CONFIG]: 'titleGuardConfig',
  [CreatorSteps.FUNDING]: 'titleFunding',
};

export const DEFAULT_TOKEN_DECIMALS = 18;

export const initialState: any = {
  essentials: {
    daoName: '',
    governance: GovernanceTypes.GNOSIS_SAFE,
  },
  govToken: {
    tokenName: '',
    tokenSupply: '',
    tokenSymbol: '',
    tokenAllocations: [
      {
        address: '',
        amount: '',
      },
    ],
    parentAllocationAmount: undefined,
  },
  /**
   * Time periods in CreatorState are denoted in MINUTES in the UI,
   * however they will be converted to SECONDS before submitting to
   * the DAO creation transaction.
   *
   * See {@link useBuildDAOTx} for more info.
   */
  govModule: {
    quorumPercentage: 4,
    timelock: 1440,
    votingPeriod: 10080,
  },
  vetoGuard: {
    executionPeriod: 2880,
    timelockPeriod: 1440,
    vetoVotesThreshold: 1,
    freezeVotesThreshold: 1,
    freezeProposalPeriod: 10080,
    freezePeriod: 10080,
  },
  funding: {
    tokensToFund: [],
    nftsToFund: [],
  },
  gnosis: {
    trustedAddresses: [''],
    signatureThreshold: 1,
    numOfSigners: 1,
  },
};
