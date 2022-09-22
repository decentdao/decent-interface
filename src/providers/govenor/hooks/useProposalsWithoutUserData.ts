import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { GovernorModule } from '../../../assets/typechain-types/module-governor';
import useBlockchainDatas from '../../../contexts/blockchainData/blockchainData';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import {
  ProposalDataWithoutUserData,
  ProposalCreatedListener,
  ProposalQueuedListener,
  ProposalState,
  ProposalExecutedListener,
  VoteCastListener,
} from '../types';
import { getProposalData, getVotePercentages } from '../utils';

export const useProposalsWithoutUserData = (governorModule: GovernorModule | undefined) => {
  const {
    state: { provider },
  } = useWeb3Provider();

  const { currentBlockNumber } = useBlockchainDatas();
  const [proposalsWithoutUserData, setProposalsWithoutUserData] =
    useState<ProposalDataWithoutUserData[]>();

  // Get initial proposal events
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    // Get an array of all the ProposalCreated events
    governorModule
      .queryFilter(filter)
      .then(proposalEvents => {
        const newProposals = proposalEvents.map((proposalEvent, index) => {
          const newProposal: ProposalDataWithoutUserData = {
            number: index,
            id: proposalEvent.args.proposalId,
            idSubstring: undefined,
            startBlock: proposalEvent.args.startBlock,
            endBlock: proposalEvent.args.endBlock,
            startTime: undefined,
            endTime: undefined,
            startTimeString: undefined,
            endTimeString: undefined,
            proposer: proposalEvent.args.proposer,
            targets: proposalEvent.args.targets,
            signatures: proposalEvent.args.signatures,
            calldatas: proposalEvent.args.calldatas,
            values: proposalEvent.args[3], // Using array index instead of 'values' since 'values' is a keyword in JS
            description: proposalEvent.args.description,
            state: undefined,
            forVotesCount: undefined,
            againstVotesCount: undefined,
            abstainVotesCount: undefined,
            forVotesPercent: undefined,
            againstVotesPercent: undefined,
            abstainVotesPercent: undefined,
            eta: undefined,
          };
          return newProposal;
        });

        return newProposals;
      })
      .then(newProposals => {
        return Promise.all(
          newProposals.map(newProposal => getProposalData(provider, governorModule, newProposal))
        );
      })
      .then(newProposals => {
        setProposalsWithoutUserData(newProposals);
      })
      .catch(logError);
  }, [governorModule, provider]);

  // Setup proposal created events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalCreated();

    const listenerCallback: ProposalCreatedListener = (
      proposalId: BigNumber,
      proposer: string,
      targets: string[],
      _values: BigNumber[],
      signatures: string[],
      calldatas: string[],
      startBlock: BigNumber,
      endBlock: BigNumber,
      description: string
    ) => {
      const newProposal: ProposalDataWithoutUserData = {
        number: -1,
        id: proposalId,
        idSubstring: undefined,
        startBlock: startBlock,
        endBlock: endBlock,
        startTime: undefined,
        endTime: undefined,
        startTimeString: undefined,
        endTimeString: undefined,
        proposer: proposer,
        targets: targets,
        signatures: signatures,
        calldatas: calldatas,
        values: _values,
        description: description,
        state: undefined,
        forVotesCount: undefined,
        againstVotesCount: undefined,
        abstainVotesCount: undefined,
        forVotesPercent: undefined,
        againstVotesPercent: undefined,
        abstainVotesPercent: undefined,
        eta: undefined,
      };

      getProposalData(provider, governorModule, newProposal)
        .then(proposalData => {
          setProposalsWithoutUserData(existingProposalsWithoutUserData => {
            if (existingProposalsWithoutUserData === undefined) {
              return undefined;
            }

            proposalData.number = existingProposalsWithoutUserData.length;
            return [...existingProposalsWithoutUserData, proposalData];
          });
        })
        .catch(logError);
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule, provider]);

  // Setup proposal queued events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalQueued();

    const listenerCallback: ProposalQueuedListener = (proposalId: BigNumber) => {
      governorModule
        .proposalEta(proposalId)
        .then(proposalEta => {
          setProposalsWithoutUserData(existingProposals => {
            if (existingProposals === undefined) {
              return undefined;
            }

            const updatedProposalIndex = existingProposals.findIndex(proposal =>
              proposalId.eq(proposal.id)
            );
            const newProposals = [...existingProposals];
            newProposals[updatedProposalIndex].state = ProposalState.Queued;
            newProposals[updatedProposalIndex].eta = proposalEta.toNumber();
            return newProposals;
          });
        })
        .catch(logError);
    };
    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Setup proposal executed events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.ProposalExecuted();

    const listenerCallback: ProposalExecutedListener = (proposalId: BigNumber) => {
      setProposalsWithoutUserData(existingProposals => {
        if (existingProposals === undefined) {
          return undefined;
        }

        const updatedProposalIndex = existingProposals.findIndex(proposal =>
          proposalId.eq(proposal.id)
        );
        const newProposals = [...existingProposals];
        newProposals[updatedProposalIndex].state = ProposalState.Executed;
        return newProposals;
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Setup vote cast events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setProposalsWithoutUserData(undefined);
      return;
    }

    const filter = governorModule.filters.VoteCast();

    const listenerCallback: VoteCastListener = (
      _voter: string,
      proposalId: BigNumber,
      support: number,
      weight: BigNumber
    ) => {
      setProposalsWithoutUserData(existingProposals => {
        if (existingProposals === undefined) {
          return undefined;
        }

        const updatedProposalIndex = existingProposals.findIndex(proposal =>
          proposalId.eq(proposal.id)
        );

        const newProposals = [...existingProposals];
        const newProposal = newProposals[updatedProposalIndex];

        if (support === 0) {
          if (newProposal.againstVotesCount === undefined) {
            newProposal.againstVotesCount = weight;
          } else {
            newProposal.againstVotesCount = newProposal.againstVotesCount.add(weight);
          }
        } else if (support === 1) {
          if (newProposal.forVotesCount === undefined) {
            newProposal.forVotesCount = weight;
          } else {
            newProposal.forVotesCount = newProposal.forVotesCount.add(weight);
          }
        } else {
          if (newProposal.abstainVotesCount === undefined) {
            newProposal.abstainVotesCount = weight;
          } else {
            newProposal.abstainVotesCount = newProposal.abstainVotesCount.add(weight);
          }
        }

        const votePercentages = getVotePercentages(
          newProposal.againstVotesCount,
          newProposal.forVotesCount,
          newProposal.abstainVotesCount
        );

        newProposal.againstVotesPercent = votePercentages.againstVotesPercent;
        newProposal.forVotesPercent = votePercentages.forVotesPercent;
        newProposal.abstainVotesPercent = votePercentages.abstainVotesPercent;

        newProposals[updatedProposalIndex] = newProposal;

        return newProposals;
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [governorModule]);

  // Check for pending proposals that have become active
  // Check for Active proposals that have become defeated/Succeeded
  useEffect(() => {
    if (currentBlockNumber === undefined) {
      return;
    }

    setProposalsWithoutUserData(existingProposals => {
      if (existingProposals === undefined) return undefined;

      return existingProposals.map(existingProposal => {
        const newProposal = existingProposal;
        if (
          newProposal.state === ProposalState.Pending &&
          newProposal.startBlock.toNumber() <= currentBlockNumber
        ) {
          newProposal.state = ProposalState.Active;
        } else if (
          newProposal.state === ProposalState.Active &&
          currentBlockNumber > newProposal.endBlock.toNumber()
        ) {
          if (newProposal.forVotesCount!.lte(newProposal.againstVotesCount!)) {
            newProposal.state = ProposalState.Defeated;
          }
          if (newProposal.forVotesCount!.gt(newProposal.againstVotesCount!)) {
            newProposal.state = ProposalState.Succeeded;
          }
        }

        return newProposal;
      });
    });
  }, [currentBlockNumber]);

  return proposalsWithoutUserData;
};
