import { useFractal } from '../../../../providers/App/AppProvider';
import { DAOInfoCard } from '../../../ui/cards/DAOInfoCard';

/**
 * Info card on the DAO homepage, which typically appears as roughly
 * 1/2 of the screen width, along with the Governance, Proposals,
 * and Treasury info cards.
 */
export function InfoDAO() {
  const { node, guardContracts, guard } = useFractal();
  return (
    <DAOInfoCard
      h="8.5rem"
      parentAddress={node.nodeHierarchy.parentAddress || undefined}
      node={node}
      childCount={node.nodeHierarchy.childNodes.length}
      freezeGuard={guard}
      guardContracts={guardContracts}
    />
  );
}
