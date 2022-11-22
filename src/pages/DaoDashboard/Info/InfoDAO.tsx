import { DAOInfoCard } from '../../../components/ui/cards/DAOInfoCard';
import { InfoBoxLoader } from '../../../components/ui/loaders/InfoBoxLoader';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';

export function InfoDAO() {
  const {
    gnosis: { safe },
  } = useFractal();

  // @todo replace mocked values
  const subDAOsWithPermissions = [];

  if (!safe.address) {
    return <InfoBoxLoader />;
  }

  return (
    <DAOInfoCard
      safeAddress={safe.address}
      numberOfChildrenDAO={subDAOsWithPermissions.length}
    />
  );
}
