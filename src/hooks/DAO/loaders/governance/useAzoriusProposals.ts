import { LinearERC20Voting, LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import {
  Azorius,
  ProposalExecutedEvent,
  ProposalCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC20VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { BigNumber } from 'ethers';
import { useEffect, useMemo } from 'react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import {
  ProposalMetadata,
  MetaTransaction,
  VotingStrategyType,
  DecodedTransaction,
} from '../../../../types';
import { AzoriusProposal, ProposalVotesSummary } from '../../../../types/daoProposal';
import { Providers } from '../../../../types/network';
import { getProposalVotesSummary, mapProposalCreatedEventToProposal } from '../../../../utils';
import useSafeContracts from '../../../safe/useSafeContracts';
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
  _erc20StrategyContract: LinearERC20Voting | undefined,
  _erc721StrategyContract: LinearERC721Voting | undefined,
  _strategyType: VotingStrategyType,
  { args: _args }: ProposalCreatedEvent,
  _erc20VotedEvents: Promise<ERC20VotedEvent[] | undefined>,
  _erc721VotedEvents: Promise<ERC721VotedEvent[] | undefined>,
  _executedEvents: Promise<ProposalExecutedEvent[] | undefined>,
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
    _erc20StrategyContract,
    _erc721StrategyContract,
    _strategyType,
    _args.proposalId,
    _args.proposer,
    _azoriusContract,
    _provider,
    _erc20VotedEvents,
    _erc721VotedEvents,
    _executedEvents,
    proposalData,
  );

  return proposal;
};

const loadAzoriusProposals = async (
  azoriusContract: Azorius,
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  strategyType: VotingStrategyType,
  provider: Providers,
  erc20VotedEvents: Promise<ERC20VotedEvent[] | undefined>,
  erc721VotedEvents: Promise<ERC721VotedEvent[] | undefined>,
  executedEvents: Promise<ProposalExecutedEvent[] | undefined>,
  decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  proposalLoaded: (proposal: AzoriusProposal) => void,
) => {
  const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();
  const proposalCreatedEvents = (
    await azoriusContract.queryFilter(proposalCreatedFilter)
  ).reverse();

  for (const proposalCreatedEvent of proposalCreatedEvents) {
    const proposal = await loadProposalFromEvent(
      provider,
      decode,
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      proposalCreatedEvent,
      erc20VotedEvents,
      erc721VotedEvents,
      executedEvents,
    );

    proposalLoaded(proposal);
  }
};

const proposalCreatedEventListener = (
  azoriusContract: Azorius,
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  erc20VotedEvents: Promise<ERC20VotedEvent[] | undefined>,
  erc721VotedEvents: Promise<ERC721VotedEvent[] | undefined>,
  executedEvents: Promise<ProposalExecutedEvent[] | undefined>,
  provider: Providers,
  strategyType: VotingStrategyType,
  decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  callback: (proposal: AzoriusProposal) => void,
): TypedListener<ProposalCreatedEvent> => {
  return async (_strategyAddress, proposalId, proposer, transactions, metadata) => {
    console.log({ metadata });
    if (!metadata) {
      return;
    }

    const metaDataEvent: ProposalMetadata = JSON.parse(metadata);
    const proposalData = {
      metaData: {
        title: metaDataEvent.title,
        description: metaDataEvent.description,
        documentationUrl: metaDataEvent.documentationUrl,
      },
      transactions: transactions,
      decodedTransactions: await decodeTransactions(decode, transactions),
    };

    const proposal = await mapProposalCreatedEventToProposal(
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      proposalId,
      proposer,
      azoriusContract,
      provider,
      erc20VotedEvents,
      erc721VotedEvents,
      executedEvents,
      proposalData,
    );

    console.log({ proposal });

    callback(proposal);
  };
};

const erc20VotedEventListener = (
  erc20StrategyContract: LinearERC20Voting,
  strategyType: VotingStrategyType,
  callback: (
    proposalId: number,
    voter: string,
    voteType: number,
    weight: BigNumber,
    votesSummary: ProposalVotesSummary,
  ) => void,
): TypedListener<ERC20VotedEvent> => {
  return async (voter, proposalId, voteType, weight) => {
    const votesSummary = await getProposalVotesSummary(
      erc20StrategyContract,
      undefined,
      strategyType,
      BigNumber.from(proposalId),
    );
    callback(proposalId, voter, voteType, weight, votesSummary);
  };
};

const erc721VotedEventListener = (
  erc721StrategyContract: LinearERC721Voting,
  strategyType: VotingStrategyType,
  callback: (
    proposalId: number,
    voter: string,
    voteType: number,
    tokenAddresses: string[],
    tokenIds: BigNumber[],
    votesSummary: ProposalVotesSummary,
  ) => void,
): TypedListener<ERC721VotedEvent> => {
  return async (voter, proposalId, voteType, tokenAddresses, tokenIds) => {
    const votesSummary = await getProposalVotesSummary(
      undefined,
      erc721StrategyContract,
      strategyType,
      BigNumber.from(proposalId),
    );
    callback(proposalId, voter, voteType, tokenAddresses, tokenIds, votesSummary);
  };
};

export const useAzoriusProposals = (
  proposalCreatedEventCallback: (proposal: AzoriusProposal) => void,
  erc20VotedEventCallback: (
    proposalId: number,
    voter: string,
    support: number,
    weight: BigNumber,
    votesSummary: ProposalVotesSummary,
  ) => void,
  erc721VotedEventCallback: (
    proposalId: number,
    voter: string,
    support: number,
    tokenAddresses: string[],
    tokenIds: BigNumber[],
    votesSummary: ProposalVotesSummary,
  ) => void,
) => {
  const {
    governanceContracts: {
      azoriusContractAddress,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    },
  } = useFractal();

  const baseContracts = useSafeContracts();
  const provider = useEthersProvider();
  const decode = useSafeDecoder();

  const azoriusContract = useMemo(() => {
    if (!baseContracts || !azoriusContractAddress) {
      return;
    }

    return baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
  }, [azoriusContractAddress, baseContracts]);

  const strategyType = useMemo(() => {
    if (ozLinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (erc721LinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [ozLinearVotingContractAddress, erc721LinearVotingContractAddress]);

  const erc20StrategyContract = useMemo(() => {
    if (!baseContracts || !ozLinearVotingContractAddress) {
      return undefined;
    }

    return baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );
  }, [baseContracts, ozLinearVotingContractAddress]);

  const erc721StrategyContract = useMemo(() => {
    if (!baseContracts || !erc721LinearVotingContractAddress) {
      return undefined;
    }

    return baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
      erc721LinearVotingContractAddress,
    );
  }, [baseContracts, erc721LinearVotingContractAddress]);

  const erc20VotedEvents = useMemo(async () => {
    if (!erc20StrategyContract) {
      return;
    }

    const filter = erc20StrategyContract.filters.Voted();
    const events = await erc20StrategyContract.queryFilter(filter);

    return events;
  }, [erc20StrategyContract]);

  const erc721VotedEvents = useMemo(async () => {
    if (!erc721StrategyContract) {
      return;
    }

    const filter = erc721StrategyContract.filters.Voted();
    const events = await erc721StrategyContract.queryFilter(filter);

    return events;
  }, [erc721StrategyContract]);

  const executedEvents = useMemo(async () => {
    if (!azoriusContract) {
      return;
    }

    const filter = azoriusContract.filters.ProposalExecuted();
    const events = await azoriusContract.queryFilter(filter);

    return events;
  }, [azoriusContract]);

  useEffect(() => {
    if (!azoriusContract || !provider || !strategyType) {
      return;
    }

    const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();
    const listener = proposalCreatedEventListener(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      erc20VotedEvents,
      erc721VotedEvents,
      executedEvents,
      provider,
      strategyType,
      decode,
      proposalCreatedEventCallback,
    );

    azoriusContract.on(proposalCreatedFilter, listener);

    return () => {
      azoriusContract.off(proposalCreatedFilter, listener);
    };
  }, [
    azoriusContract,
    decode,
    erc20StrategyContract,
    erc20VotedEvents,
    erc721StrategyContract,
    erc721VotedEvents,
    executedEvents,
    proposalCreatedEventCallback,
    provider,
    strategyType,
  ]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC20 || !erc20StrategyContract) {
      return;
    }

    const votedEvent = erc20StrategyContract.filters.Voted();
    const listener = erc20VotedEventListener(
      erc20StrategyContract as LinearERC20Voting,
      strategyType,
      erc20VotedEventCallback,
    );

    erc20StrategyContract.on(votedEvent, listener);

    return () => {
      erc20StrategyContract.off(votedEvent, listener);
    };
  }, [erc20VotedEventCallback, erc20StrategyContract, strategyType]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC721 || !erc721StrategyContract) {
      return;
    }

    const votedEvent = erc721StrategyContract.filters.Voted();
    const listener = erc721VotedEventListener(
      erc721StrategyContract,
      strategyType,
      erc721VotedEventCallback,
    );

    erc721StrategyContract.on(votedEvent, listener);

    return () => {
      erc721StrategyContract.off(votedEvent, listener);
    };
  }, [erc721VotedEventCallback, erc721StrategyContract, strategyType]);

  if (!azoriusContract || !strategyType || !provider) {
    return undefined;
  }

  return {
    loadAzoriusProposals: (proposalLoaded: (proposal: AzoriusProposal) => void) => {
      return loadAzoriusProposals(
        azoriusContract,
        erc20StrategyContract,
        erc721StrategyContract,
        strategyType,
        provider,
        erc20VotedEvents,
        erc721VotedEvents,
        executedEvents,
        decode,
        proposalLoaded,
      );
    },
  };
};
