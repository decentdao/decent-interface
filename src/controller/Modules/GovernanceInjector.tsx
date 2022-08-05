import React from 'react';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { useTreasuryModule } from '../../providers/treasury/hooks/useTreasuryModule';

/**
 * Handles passing 'createProposal' to plugins for this module
 * Each Governor module should have it's own injector to pull information from context provider to pass to the Plugins
 */
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
