import React from 'react';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { useTreasuryModule } from '../../providers/treasury/hooks/useTreasuryModule';

export function GovernanceInjector({ children }: { children: JSX.Element }) {
  const {
    createProposal: { pendingCreateTx, submitProposal },
    votingToken,
    governorModuleContract,
  } = useGovenorModule();
  const { treasuryModuleContract } = useTreasuryModule();

  if (!governorModuleContract) {
    return null;
  }

  return React.cloneElement(children, {
    votingToken,
    createProposal: submitProposal,
    pending: pendingCreateTx,
    treasuryModuleContract,
    governanceAddress: governorModuleContract.address,
  });
}
