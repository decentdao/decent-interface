import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  GetContractEventsReturnType,
  GetContractReturnType,
  PublicClient,
  getAddress,
  getContract,
} from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../../assets/abi/Azorius';
import LinearERC20VotingAbi from '../../../../assets/abi/LinearERC20Voting';
import LinearERC721VotingAbi from '../../../../assets/abi/LinearERC721Voting';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import {
  CreateProposalMetadata,
  VotingStrategyType,
  DecodedTransaction,
  MetaTransaction,
} from '../../../../types';
import { AzoriusProposal } from '../../../../types/daoProposal';
import { Providers } from '../../../../types/network';
import { mapProposalCreatedEventToProposal, decodeTransactions } from '../../../../utils';
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

  const provider = useEthersProvider();
  const decode = useSafeDecoder();

  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!azoriusContractAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusContractAddress),
      client: publicClient,
    });
  }, [azoriusContractAddress, publicClient]);

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
    if (!erc721LinearVotingContractAddress || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: LinearERC721VotingAbi,
      address: getAddress(erc721LinearVotingContractAddress),
      client: publicClient,
    });
  }, [erc721LinearVotingContractAddress, publicClient]);

  const erc20VotedEvents = useMemo(async () => {
    if (!erc20StrategyContract) {
      return;
    }

    const events = await erc20StrategyContract.getEvents.Voted();
    return events;
  }, [erc20StrategyContract]);

  const erc721VotedEvents = useMemo(async () => {
    if (!erc721StrategyContract) {
      return;
    }

    const events = await erc721StrategyContract.getEvents.Voted();
    return events;
  }, [erc721StrategyContract]);

  const executedEvents = useMemo(async () => {
    if (!azoriusContract) {
      return;
    }

    const events = await azoriusContract.getEvents.ProposalExecuted();
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
      _azoriusContract: GetContractReturnType<typeof AzoriusAbi, PublicClient> | undefined,
      _erc20StrategyContract:
        | GetContractReturnType<typeof LinearERC20VotingAbi, PublicClient>
        | undefined,
      _erc721StrategyContract:
        | GetContractReturnType<typeof LinearERC721VotingAbi, PublicClient>
        | undefined,
      _strategyType: VotingStrategyType | undefined,
      _erc20VotedEvents:
        | GetContractEventsReturnType<typeof LinearERC20VotingAbi, 'Voted'>
        | undefined,
      _erc721VotedEvents:
        | GetContractEventsReturnType<typeof LinearERC721VotingAbi, 'Voted'>
        | undefined,
      _executedEvents:
        | GetContractEventsReturnType<typeof AzoriusAbi, 'ProposalExecuted'>
        | undefined,
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
      const proposalCreatedEvents = (await _azoriusContract.getEvents.ProposalCreated()).reverse();

      for (const proposalCreatedEvent of proposalCreatedEvents) {
        let proposalData;
        if (proposalCreatedEvent.args.metadata) {
          try {
            const metadataEvent: CreateProposalMetadata = JSON.parse(
              proposalCreatedEvent.args.metadata,
            );

            let transactions: MetaTransaction[] = [];
            let decodedTransactions: DecodedTransaction[] = [];

            if (proposalCreatedEvent.args.transactions) {
              transactions = proposalCreatedEvent.args.transactions.map(t => ({
                to: t.to,
                data: t.data,
                value: t.value,
                operation: t.operation,
              }));

              decodedTransactions = await decodeTransactions(_decode, transactions);
            }

            proposalData = {
              metaData: {
                title: metadataEvent.title,
                description: metadataEvent.description,
                documentationUrl: metadataEvent.documentationUrl,
              },
              transactions,
              decodedTransactions,
            };
          } catch {
            logError(
              'Unable to parse proposal metadata or transactions',
              'metadata:',
              proposalCreatedEvent.args.metadata,
              'transactions:',
              proposalCreatedEvent.args.transactions,
            );
          }
        }

        if (!proposalCreatedEvent.args.proposalId || !proposalCreatedEvent.args.proposer) {
          continue;
        }

        const proposal = await mapProposalCreatedEventToProposal(
          _erc20StrategyContract,
          _erc721StrategyContract,
          _strategyType,
          Number(proposalCreatedEvent.args.proposalId),
          proposalCreatedEvent.args.proposer || '',
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

  return async (proposalLoaded: (proposal: AzoriusProposal) => void) => {
    return loadAzoriusProposals(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      await erc20VotedEvents,
      await erc721VotedEvents,
      await executedEvents,
      provider,
      decode,
      proposalLoaded,
    );
  };
};
