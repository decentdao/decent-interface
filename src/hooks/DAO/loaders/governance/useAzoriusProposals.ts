import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Address,
  GetContractEventsReturnType,
  GetContractReturnType,
  PublicClient,
  getContract,
} from 'viem';
import { usePublicClient } from 'wagmi';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import {
  CreateProposalMetadata,
  VotingStrategyType,
  DecodedTransaction,
  FractalProposalState,
} from '../../../../types';
import { AzoriusProposal } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, decodeTransactions } from '../../../../utils';
import { CacheExpiry, CacheKeys } from '../../../utils/cache/cacheDefaults';
import { getValue, setValue } from '../../../utils/cache/useLocalStorage';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

type OnProposalLoaded = (proposal: AzoriusProposal) => void;

export const useAzoriusProposals = () => {
  const currentAzoriusAddress = useRef<string>();

  const {
    governanceContracts: {
      moduleAzoriusAddress,
      linearVotingErc20Address,
      linearVotingErc721Address,
    },
    action,
  } = useFractal();
  const decode = useSafeDecoder();
  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!moduleAzoriusAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: abis.Azorius,
      address: moduleAzoriusAddress,
      client: publicClient,
    });
  }, [moduleAzoriusAddress, publicClient]);

  const strategyType = useMemo(() => {
    if (linearVotingErc20Address) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (linearVotingErc721Address) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [linearVotingErc20Address, linearVotingErc721Address]);

  const erc20StrategyContract = useMemo(() => {
    if (!linearVotingErc20Address || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: abis.LinearERC20Voting,
      address: linearVotingErc20Address,
      client: publicClient,
    });
  }, [linearVotingErc20Address, publicClient]);

  const erc721StrategyContract = useMemo(() => {
    if (!linearVotingErc721Address || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: abis.LinearERC721Voting,
      address: linearVotingErc721Address,
      client: publicClient,
    });
  }, [linearVotingErc721Address, publicClient]);

  const erc20VotedEvents = useMemo(async () => {
    if (!erc20StrategyContract) {
      return;
    }

    const events = await erc20StrategyContract.getEvents.Voted({ fromBlock: 0n });
    return events;
  }, [erc20StrategyContract]);

  const erc721VotedEvents = useMemo(async () => {
    if (!erc721StrategyContract) {
      return;
    }

    const events = await erc721StrategyContract.getEvents.Voted({ fromBlock: 0n });
    return events;
  }, [erc721StrategyContract]);

  const executedEvents = useMemo(async () => {
    if (!azoriusContract) {
      return;
    }

    const events = await azoriusContract.getEvents.ProposalExecuted({ fromBlock: 0n });
    return events;
  }, [azoriusContract]);

  useEffect(() => {
    if (!moduleAzoriusAddress) {
      currentAzoriusAddress.current = undefined;
    }

    if (moduleAzoriusAddress && currentAzoriusAddress.current !== moduleAzoriusAddress) {
      currentAzoriusAddress.current = moduleAzoriusAddress;
    }
  }, [moduleAzoriusAddress]);

  const { t } = useTranslation('proposal');

  const loadAzoriusProposals = useCallback(
    async (
      _azoriusContract: GetContractReturnType<typeof abis.Azorius, PublicClient> | undefined,
      _erc20StrategyContract:
        | GetContractReturnType<typeof abis.LinearERC20Voting, PublicClient>
        | undefined,
      _erc721StrategyContract:
        | GetContractReturnType<typeof abis.LinearERC721Voting, PublicClient>
        | undefined,
      _strategyType: VotingStrategyType | undefined,
      _erc20VotedEvents:
        | GetContractEventsReturnType<typeof abis.LinearERC20Voting, 'Voted'>
        | undefined,
      _erc721VotedEvents:
        | GetContractEventsReturnType<typeof abis.LinearERC721Voting, 'Voted'>
        | undefined,
      _executedEvents:
        | GetContractEventsReturnType<typeof abis.Azorius, 'ProposalExecuted'>
        | undefined,
      _publicClient: PublicClient | undefined,
      _decode: (
        value: string,
        to: Address,
        data?: string | undefined,
      ) => Promise<DecodedTransaction[]>,
      _proposalLoaded: OnProposalLoaded,
    ) => {
      if (!_strategyType || !_azoriusContract || !_publicClient) {
        return;
      }
      const proposalCreatedEvents = (
        await _azoriusContract.getEvents.ProposalCreated({ fromBlock: 0n })
      ).reverse();

      action.dispatch({
        type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED,
        payload: false,
      });

      action.dispatch({
        type: FractalGovernanceAction.SET_LOADING_FIRST_PROPOSAL,
        payload: true,
      });

      const completeOneProposalLoadProcess = (proposal: AzoriusProposal) => {
        if (currentAzoriusAddress.current !== moduleAzoriusAddress) {
          // The DAO has changed, don't load the just-fetched proposal,
          // into state, and get out of this function completely.
          return;
        }

        _proposalLoaded(proposal);

        action.dispatch({
          type: FractalGovernanceAction.SET_LOADING_FIRST_PROPOSAL,
          payload: false,
        });
      };

      const parseProposalMetadata = (metadata: string): CreateProposalMetadata => {
        try {
          const createProposalMetadata: CreateProposalMetadata = JSON.parse(metadata);
          return createProposalMetadata;
        } catch {
          logError('Unable to parse proposal metadata.', 'metadata:', metadata);
          return {
            title: t('metadataFailedParsePlaceholder'),
            description: '',
          };
        }
      };

      for (const proposalCreatedEvent of proposalCreatedEvents) {
        if (proposalCreatedEvent.args.proposalId === undefined) {
          continue;
        }

        const cachedProposal = getValue({
          cacheName: CacheKeys.PROPOSAL_CACHE,
          proposalId: proposalCreatedEvent.args.proposalId.toString(),
          contractAddress: _azoriusContract.address,
        });

        if (cachedProposal) {
          completeOneProposalLoadProcess(cachedProposal);
          continue;
        }

        let proposalData;

        if (proposalCreatedEvent.args.metadata && proposalCreatedEvent.args.transactions) {
          const metadataEvent = parseProposalMetadata(proposalCreatedEvent.args.metadata);

          try {
            const decodedTransactions = await decodeTransactions(
              _decode,
              proposalCreatedEvent.args.transactions.map(tx => ({
                ...tx,
                to: tx.to,
                data: tx.data,
                value: tx.value,
              })),
            );

            proposalData = {
              metaData: {
                title: metadataEvent.title,
                description: metadataEvent.description,
                documentationUrl: metadataEvent.documentationUrl,
              },
              transactions: proposalCreatedEvent.args.transactions.map(tx => ({
                ...tx,
                to: tx.to,
                value: tx.value,
                data: tx.data,
              })),
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

        if (proposalCreatedEvent.args.proposer === undefined) {
          continue;
        }

        const proposal = await mapProposalCreatedEventToProposal(
          proposalCreatedEvent.transactionHash,
          _erc20StrategyContract,
          _erc721StrategyContract,
          _strategyType,
          Number(proposalCreatedEvent.args.proposalId),
          proposalCreatedEvent.args.proposer,
          _azoriusContract,
          _publicClient,
          _erc20VotedEvents,
          _erc721VotedEvents,
          _executedEvents,
          proposalData,
        );

        completeOneProposalLoadProcess(proposal);

        const isProposalFossilized =
          proposal.state === FractalProposalState.CLOSED ||
          proposal.state === FractalProposalState.EXECUTED ||
          proposal.state === FractalProposalState.FAILED ||
          proposal.state === FractalProposalState.EXPIRED ||
          proposal.state === FractalProposalState.REJECTED;

        if (isProposalFossilized) {
          setValue(
            {
              cacheName: CacheKeys.PROPOSAL_CACHE,
              proposalId: proposalCreatedEvent.args.proposalId.toString(),
              contractAddress: _azoriusContract.address,
            },
            proposal,
            CacheExpiry.NEVER,
          );
        }
      }

      // Just in case there are no `proposalCreatedEvent`s, we still need to set the loading state to false.
      action.dispatch({
        type: FractalGovernanceAction.SET_LOADING_FIRST_PROPOSAL,
        payload: false,
      });

      action.dispatch({
        type: FractalGovernanceAction.SET_ALL_PROPOSALS_LOADED,
        payload: true,
      });
    },
    [action, moduleAzoriusAddress, t],
  );

  return async (proposalLoaded: OnProposalLoaded) =>
    loadAzoriusProposals(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      await erc20VotedEvents,
      await erc721VotedEvents,
      await executedEvents,
      publicClient,
      decode,
      proposalLoaded,
    );
};
