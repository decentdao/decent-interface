import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlockchainData } from '../../contexts/blockchainData';
import useExecuteTransaction from '../../hooks/useExecuteTransaction';
import { ProposalData, ProposalState } from '../../providers/govenor/types';
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

  const { t } = useTranslation(['common', 'proposal']);

  if (!show) return null;

  return (
    <ProposalAction
      btnLabel={t('execute')}
      label={t('labelExecute', { ns: 'proposal' })}
      actionFunc={executeTransaction}
      pending={pending}
    />
  );
}

export default ProposalExecute;
