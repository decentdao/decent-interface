import { LinearERC20Voting, LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import {
  Azorius,
  ProposalExecutedEvent,
  ProposalCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { useMemo } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import {
  ProposalMetadata,
  MetaTransaction,
  VotingStrategyType,
  DecodedTransaction,
} from '../../../../types';
import { AzoriusProposal } from '../../../../types/daoProposal';
import { Providers } from '../../../../types/network';
import { mapProposalCreatedEventToProposal } from '../../../../utils';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useAsyncRetry } from '../../../utils/useAsyncRetry';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

const decodeTransactions = async (
  _decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  _transactions: MetaTransaction[],
) => {
  const decodedTransactions = await Promise.all(
    _transactions.map(async tx => _decode(tx.value.toString(), tx.to, tx.data)),
  );
  return decodedTransactions.flat();
};

const loadProposalFromEvent = async (
  _provider: Providers,
  _decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  _azoriusContract: Azorius,
  _strategyContract: LinearERC20Voting | LinearERC721Voting,
  _strategyType: VotingStrategyType,
  { args: _args }: ProposalCreatedEvent,
  _votedEvents: VotedEvent[],
  _executedEvents: ProposalExecutedEvent[],
) => {
  let proposalData;
  if (_args.metadata) {
    const metadataEvent: ProposalMetadata = JSON.parse(_args.metadata);
    const decodedTransactions = await decodeTransactions(_decode, _args.transactions);
    proposalData = {
      metaData: {
        title: metadataEvent.title,
        description: metadataEvent.description,
        documentationUrl: metadataEvent.documentationUrl,
      },
      transactions: _args.transactions,
      decodedTransactions,
    };
  }

  const proposal = await mapProposalCreatedEventToProposal(
    _strategyContract,
    _strategyType,
    _args.proposalId,
    _args.proposer,
    _azoriusContract,
    _provider,
    _votedEvents,
    _executedEvents,
    proposalData,
  );

  return proposal;
};

const loadAzoriusProposals = async (
  azoriusContract: Azorius,
  strategyContract: LinearERC20Voting | LinearERC721Voting,
  strategyType: VotingStrategyType,
  provider: Providers,
  decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  proposalLoaded: (proposal: AzoriusProposal) => void,
) => {
  const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();
  const proposalCreatedEvents = (
    await azoriusContract.queryFilter(proposalCreatedFilter)
  ).reverse();

  const votedEventFilter = strategyContract.filters.Voted();
  const votedEvents = await strategyContract.queryFilter(votedEventFilter);

  const proposalExecutedEventFilter = azoriusContract.filters.ProposalExecuted();
  const proposalExecutedEvents = await azoriusContract.queryFilter(proposalExecutedEventFilter);

  for (const proposalCreatedEvent of proposalCreatedEvents) {
    const proposal = await loadProposalFromEvent(
      provider,
      decode,
      azoriusContract,
      strategyContract,
      strategyType,
      proposalCreatedEvent,
      votedEvents,
      proposalExecutedEvents,
    );

    proposalLoaded(proposal);
  }
};

export const useAzoriusProposals = () => {
  const {
    governanceContracts: {
      azoriusContractAddress,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    },
  } = useFractal();

  const strategyType = useMemo(() => {
    if (ozLinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (erc721LinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [ozLinearVotingContractAddress, erc721LinearVotingContractAddress]);

  const baseContracts = useSafeContracts();
  const provider = useEthersProvider();
  const decode = useSafeDecoder();

  if (!azoriusContractAddress || !strategyType || !provider || !baseContracts) {
    return undefined;
  }

  const azoriusContract =
    baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);

  let strategyContract: LinearERC20Voting | LinearERC721Voting;
  if (ozLinearVotingContractAddress) {
    strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );
  } else if (erc721LinearVotingContractAddress) {
    strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      erc721LinearVotingContractAddress,
    );
  } else {
    logError('No strategy contract found');
    return undefined;
  }

  // const { requestWithRetries } = useAsyncRetry();
  // // Azrious proposals are listeners
  // const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
  //   async (strategyAddress, proposalId, proposer, transactions, _metadata) => {
  //     if (
  //       !azoriusContractAddress ||
  //       !(ozLinearVotingContractAddress || erc721LinearVotingContractAddress) ||
  //       !strategyType ||
  //       !provider ||
  //       !baseContracts
  //     ) {
  //       return;
  //     }
  //     let proposalData: ProposalData | undefined;
  //     const azoriusContract =
  //       baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
  //     if (_metadata) {
  //       const metaDataEvent: ProposalMetadata = JSON.parse(_metadata);
  //       proposalData = {
  //         metaData: {
  //           title: metaDataEvent.title,
  //           description: metaDataEvent.description,
  //           documentationUrl: metaDataEvent.documentationUrl,
  //         },
  //         transactions: transactions,
  //         decodedTransactions: await decodeTransactions(transactions),
  //       };
  //     }
  //     let strategyContract: LinearERC20Voting | LinearERC721Voting;
  //     if (ozLinearVotingContractAddress) {
  //       strategyContract =
  //         baseContracts.linearVotingMasterCopyContract.asProvider.attach(strategyAddress);
  //     } else if (erc721LinearVotingContractAddress) {
  //       strategyContract =
  //         baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(strategyAddress);
  //     } else {
  //       logError('No strategy contract found');
  //       return [];
  //     }
  //     const func = async () => {
  //       return mapProposalCreatedEventToProposal(
  //         strategyContract,
  //         strategyType,
  //         proposalId,
  //         proposer,
  //         azoriusContract,
  //         provider,
  //         proposalData,
  //       );
  //     };
  //     const proposal = await requestWithRetries(func, 5, 7000);
  //     if (proposal) {
  //       action.dispatch({
  //         type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
  //         payload: proposal,
  //       });
  //     }
  //   },
  //   [
  //     baseContracts,
  //     azoriusContractAddress,
  //     provider,
  //     decodeTransactions,
  //     action,
  //     requestWithRetries,
  //     strategyType,
  //     ozLinearVotingContractAddress,
  //     erc721LinearVotingContractAddress,
  //   ],
  // );

  // const erc20ProposalVotedEventListener: TypedListener<ERC20VotedEvent> = useCallback(
  //   async (voter, proposalId, support, weight) => {
  //     if (!ozLinearVotingContractAddress || !strategyType || !baseContracts) {
  //       return;
  //     }
  //     const strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
  //       ozLinearVotingContractAddress,
  //     );

  //     const votesSummary = await getProposalVotesSummary(
  //       strategyContract,
  //       strategyType,
  //       BigNumber.from(proposalId),
  //     );

  //     action.dispatch({
  //       type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
  //       payload: {
  //         proposalId: proposalId.toString(),
  //         voter,
  //         support,
  //         weight,
  //         votesSummary,
  //       },
  //     });
  //   },
  //   [ozLinearVotingContractAddress, action, strategyType, baseContracts],
  // );

  // const erc721ProposalVotedEventListener: TypedListener<ERC721VotedEvent> = useCallback(
  //   async (voter, proposalId, support, tokenAddresses, tokenIds) => {
  //     if (!erc721LinearVotingContractAddress || !strategyType || !baseContracts) {
  //       return;
  //     }
  //     const strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
  //       erc721LinearVotingContractAddress,
  //     );
  //     const votesSummary = await getProposalVotesSummary(
  //       strategyContract,
  //       strategyType,
  //       BigNumber.from(proposalId),
  //     );

  //     action.dispatch({
  //       type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
  //       payload: {
  //         proposalId: proposalId.toString(),
  //         voter,
  //         support,
  //         tokenAddresses,
  //         tokenIds: tokenIds.map(tokenId => tokenId.toString()),
  //         votesSummary,
  //       },
  //     });
  //   },
  //   [erc721LinearVotingContractAddress, action, strategyType, baseContracts],
  // );

  // useEffect(() => {
  //   if (!azoriusContractAddress || !baseContracts) {
  //     return;
  //   }

  //   const azoriusContract =
  //     baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
  //   const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();

  //   azoriusContract.on(proposalCreatedFilter, proposalCreatedListener);

  //   return () => {
  //     azoriusContract.off(proposalCreatedFilter, proposalCreatedListener);
  //   };
  // }, [azoriusContractAddress, proposalCreatedListener, baseContracts]);

  // useEffect(() => {
  //   if (ozLinearVotingContractAddress && baseContracts) {
  //     const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
  //       ozLinearVotingContractAddress,
  //     );

  //     const votedEvent = ozLinearVotingContract.filters.Voted();

  //     ozLinearVotingContract.on(votedEvent, erc20ProposalVotedEventListener);

  //     return () => {
  //       ozLinearVotingContract.off(votedEvent, erc20ProposalVotedEventListener);
  //     };
  //   } else if (erc721LinearVotingContractAddress && baseContracts) {
  //     const erc721LinearVotingContract =
  //       baseContracts.linearVotingMasterCopyContract.asProvider.attach(
  //         erc721LinearVotingContractAddress,
  //       );
  //     const votedEvent = erc721LinearVotingContract.filters.Voted();

  //     erc721LinearVotingContract.on(votedEvent, erc721ProposalVotedEventListener);

  //     return () => {
  //       erc721LinearVotingContract.off(votedEvent, erc721ProposalVotedEventListener);
  //     };
  //   }
  // }, [
  //   ozLinearVotingContractAddress,
  //   erc721LinearVotingContractAddress,
  //   erc20ProposalVotedEventListener,
  //   erc721ProposalVotedEventListener,
  //   baseContracts,
  // ]);

  return (proposalLoaded: (proposal: AzoriusProposal) => void) => {
    return loadAzoriusProposals(
      azoriusContract,
      strategyContract,
      strategyType,
      provider,
      decode,
      proposalLoaded,
    );
  };
};
