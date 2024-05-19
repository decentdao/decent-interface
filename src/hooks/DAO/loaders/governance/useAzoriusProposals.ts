import { LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import {
  Azorius,
  ProposalExecutedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  GetContractEventsReturnType,
  GetContractReturnType,
  Hex,
  PublicClient,
  getAddress,
  getContract,
} from 'viem';
import { usePublicClient } from 'wagmi';
import LinearERC20VotingAbi from '../../../../assets/abi/LinearERC20Voting';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { CreateProposalMetadata, VotingStrategyType, DecodedTransaction } from '../../../../types';
import { AzoriusProposal } from '../../../../types/daoProposal';
import { Providers } from '../../../../types/network';
import { mapProposalCreatedEventToProposal, decodeTransactions } from '../../../../utils';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusProposals = () => {
  const currentAzoriusAddress = useRef<string>();

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

  const publicClient = usePublicClient();

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
    if (!ozLinearVotingContractAddress || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: LinearERC20VotingAbi,
      address: getAddress(ozLinearVotingContractAddress),
      client: publicClient,
    });
  }, [ozLinearVotingContractAddress, publicClient]);

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

    return erc20StrategyContract.getEvents.Voted();
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
    if (!azoriusContractAddress) {
      currentAzoriusAddress.current = undefined;
    }

    if (azoriusContractAddress && currentAzoriusAddress.current !== azoriusContractAddress) {
      currentAzoriusAddress.current = azoriusContractAddress;
    }
  }, [azoriusContractAddress]);

  const loadAzoriusProposals = useCallback(
    async (
      _azoriusContract: Azorius | undefined,
      _erc20StrategyContract:
        | GetContractReturnType<typeof LinearERC20VotingAbi, PublicClient>
        | undefined,
      _erc721StrategyContract: LinearERC721Voting | undefined,
      _strategyType: VotingStrategyType | undefined,
      _erc20VotedEvents: Promise<
        GetContractEventsReturnType<typeof LinearERC20VotingAbi, 'Voted'> | undefined
      >,
      _erc721VotedEvents: Promise<ERC721VotedEvent[] | undefined>,
      _executedEvents: Promise<ProposalExecutedEvent[] | undefined>,
      _provider: Providers | undefined,
      _decode: (
        value: string,
        to: string,
        data?: string | undefined,
      ) => Promise<DecodedTransaction[]>,
      _proposalLoaded: (proposal: AzoriusProposal) => void,
    ) => {
      if (!_strategyType || !_azoriusContract || !_provider) {
        return;
      }

      const proposalCreatedFilter = _azoriusContract.filters.ProposalCreated();
      const proposalCreatedEvents = (
        await _azoriusContract.queryFilter(proposalCreatedFilter)
      ).reverse();

      for (const proposalCreatedEvent of proposalCreatedEvents) {
        let proposalData;
        if (proposalCreatedEvent.args.metadata) {
          try {
            const metadataEvent: CreateProposalMetadata = JSON.parse(
              proposalCreatedEvent.args.metadata,
            );

            const decodedTransactions = await decodeTransactions(
              _decode,
              proposalCreatedEvent.args.transactions.map(t => ({
                ...t,
                to: getAddress(t.to),
                // @dev if decodeTransactions worked - we can be certain that this is Hex so type casting should be save.
                // Also this will change and this casting won't be needed after migrating to viem's getContract
                data: t.data as Hex,
                value: t.value.toBigInt(),
              })),
            );
            proposalData = {
              metaData: {
                title: metadataEvent.title,
                description: metadataEvent.description,
                documentationUrl: metadataEvent.documentationUrl,
              },
              transactions: proposalCreatedEvent.args.transactions.map(t => ({
                ...t,
                to: getAddress(t.to),
                value: t.value.toBigInt(),
                data: t.data as Hex, // @dev Same here
              })),
              decodedTransactions,
            };
          } catch {
            logError(
              'Unable to parse proposal metadata or transactions.',
              'metadata:',
              proposalCreatedEvent.args.metadata,
              'transactions:',
              proposalCreatedEvent.args.transactions,
            );
          }
        }

        const proposal = await mapProposalCreatedEventToProposal(
          _erc20StrategyContract,
          _erc721StrategyContract,
          _strategyType,
          proposalCreatedEvent.args.proposalId.toBigInt(),
          proposalCreatedEvent.args.proposer,
          _azoriusContract,
          _provider,
          _erc20VotedEvents,
          _erc721VotedEvents,
          _executedEvents,
          proposalData,
        );

        if (currentAzoriusAddress.current !== azoriusContractAddress) {
          // The DAO has changed, don't load the just-fetched proposal,
          // into state, and get out of this function completely.
          return;
        }

        _proposalLoaded(proposal);
      }
    },
    [azoriusContractAddress],
  );

  return (proposalLoaded: (proposal: AzoriusProposal) => void) => {
    return loadAzoriusProposals(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      erc20VotedEvents,
      erc721VotedEvents,
      executedEvents,
      provider,
      decode,
      proposalLoaded,
    );
  };
};
