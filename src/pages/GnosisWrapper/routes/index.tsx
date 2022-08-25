import { Routes, Route, Navigate } from 'react-router-dom';
import { GnosisWrapper } from '..';
import { useGnosisWrapper } from '../../../providers/gnosis/hooks/useGnosisWrapper';
import ProposalCreate from '../../ProposalCreate';

export function GnosisRoutes() {
  const { createProposal, createPendingTx } = useGnosisWrapper();
  return (
    <Routes>
      <Route
        index
        element={<GnosisWrapper />}
      />
      <Route
        index
        element={
          <Navigate
            to="./.."
            replace={true}
          />
        }
      />
      <Route
        path="proposals/new"
        element={
          <ProposalCreate
            submitProposal={createProposal}
            pendingCreateTx={createPendingTx}
            isUserAuthorized={true}
          />
        }
      />
    </Routes>
  );
}
