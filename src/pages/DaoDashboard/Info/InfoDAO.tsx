import { DAOInfoCard } from '../../../components/ui/cards/DAOInfoCard';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';

export function InfoDAO() {
  const {
    gnosis: { safe },
  } = useFractal();

  // @todo replace mocked values
  const subDAOsWithPermissions = [];

  if (!safe.address) {
    // @todo replace with a loader
    return <div />;
  }

  return (
    <DAOInfoCard
      safeAddress={safe.address}
      numberOfChildrenDAO={subDAOsWithPermissions.length}
    />
  );
}
