import { useState, useEffect } from 'react';
import { ProposalData, ProposalState } from '../../contexts/daoData/useProposals';
import useExecuteTransaction from '../../hooks/useExecuteTransaction';
import { useBlockchainData } from '../../contexts/blockchainData';
import { ProposalAction } from './ProposalAction';

function ProposalExecute({ proposal }: { proposal: ProposalData }) {
  const [show, setShow] = useState<boolean>(false);
  const { currentTimestamp } = useBlockchainData();
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    if (proposal.eta === undefined || currentTimestamp === undefined) {
      setShow(false);
      return;
    }

    // Show component if the proposal is Queued, and the execution ETA has elapsed
    setShow(
      proposal.state === ProposalState.Queued &&
        proposal.eta !== 0 &&
        proposal.eta < currentTimestamp
    );
  }, [currentTimestamp, proposal]);

  const executeTransaction = useExecuteTransaction({
    proposalData: proposal,
    setPending,
  });

  if (!show) return null;

  return (
    <ProposalAction
      btnLabel="Execute"
      label="Proposal ready for execution"
      actionFunc={executeTransaction}
      pending={pending}
    />
  );
}

export default ProposalExecute;
