import { ProposalCreatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { Dispatch, useCallback, useEffect } from 'react';
import { TypedListener } from '../../../../assets/typechain-types/usul/common';
import { decodeTransactions } from '../../../../utils/crypto';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import { IGovernance, TxProposalState } from '../../types';
import { mapProposalCreatedEventToProposal } from '../../utils';
import { GovernanceActions, GovernanceAction } from '../actions';

interface IUseUsulProposals {
  governance: IGovernance;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export default function useUsulProposals({
  governance: {
    txProposalsInfo,
    contracts: { usulContract },
  },
  governanceDispatch,
}: IUseUsulProposals) {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (...[strategyAddress, proposalNumber, proposer]) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        signerOrProvider
      );

      const proposals = [...txProposalsInfo.txProposals, proposal];

      governanceDispatch({
        type: GovernanceAction.UPDATE_PROPOSALS,
        payload: {
          txProposals: proposals,
          passed: txProposalsInfo.passed,
          pending: txProposalsInfo.pending ? txProposalsInfo.pending : 1,
        },
      });
    },
    [usulContract, signerOrProvider, governanceDispatch, txProposalsInfo]
  );

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }
    const filter = usulContract.filters.ProposalCreated();

    usulContract.on(filter, proposalCreatedListener);

    return () => {
      usulContract.off(filter, proposalCreatedListener);
    };
  }, [usulContract, signerOrProvider, proposalCreatedListener]);

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const loadProposals = async () => {
      const proposalCreatedFilter = usulContract.filters.ProposalCreated();
      const proposalMetaDataCreatedFilter = usulContract.filters.ProposalMetadataCreated();
      const proposalCreatedEvents = await usulContract.queryFilter(proposalCreatedFilter);
      const proposalMetaDataCreatedEvents = await usulContract.queryFilter(
        proposalMetaDataCreatedFilter
      );

      const mappedProposals = await Promise.all(
        proposalCreatedEvents.map(({ args }) => {
          const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
            event.args.proposalId.eq(args.proposalNumber)
          );
          let metaData;
          if (metaDataEvent) {
            metaData = {
              decodedTransactions: decodeTransactions(metaDataEvent.args[1]),
            };
          }
          return mapProposalCreatedEventToProposal(
            args[0],
            args[1],
            args[2],
            usulContract,
            signerOrProvider,
            metaData
          );
        })
      );
      const passedProposals = mappedProposals.reduce(
        (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
        0
      );
      // @todo no queued?
      const pendingProposals = mappedProposals.reduce(
        (prev, proposal) =>
          proposal.state === TxProposalState.Active || proposal.state === TxProposalState.Pending
            ? prev + 1
            : prev,
        0
      );
      governanceDispatch({
        type: GovernanceAction.UPDATE_PROPOSALS,
        payload: {
          txProposals: mappedProposals,
          passed: passedProposals,
          pending: pendingProposals,
        },
      });
    };

    loadProposals();
  }, [usulContract, signerOrProvider, governanceDispatch]);
}
