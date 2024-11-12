import { Outlet } from 'react-router-dom';
import useDAOController from '../hooks/DAO/useDAOController';
import { useParseSafeAddress } from '../hooks/DAO/useParseSafeAddress';
import { useAutomaticSwitchChain } from '../hooks/utils/useAutomaticSwitchChain';
import { usePageTitle } from '../hooks/utils/usePageTitle';
import { useTemporaryProposals } from '../hooks/utils/useTemporaryProposals';
import { useUpdateSafeData } from '../hooks/utils/useUpdateSafeData';
import LoadingProblem from './LoadingProblem';

export function SafeController() {
  const { invalidQuery, wrongNetwork, addressPrefix, safeAddress } = useParseSafeAddress();

  useUpdateSafeData(safeAddress);
  usePageTitle();
  useTemporaryProposals();
  useAutomaticSwitchChain({ addressPrefix });

  const { errorLoading } = useDAOController({
    addressPrefix,
    safeAddress,
  });

  // the order of the if blocks of these next three error states matters
  if (invalidQuery) {
    return <LoadingProblem type="badQueryParam" />;
  } else if (wrongNetwork) {
    return <LoadingProblem type="wrongNetwork" />;
  } else if (errorLoading) {
    return <LoadingProblem type="invalidSafe" />;
  }

  return <Outlet />;
}
