import { useMemo } from 'react';
import lizzardsDAOMetadata from '../../metadata/lizzardsDAO';
import { useFractal } from '../../providers/App/AppProvider';

export default function useDAOMetadata() {
  const storeState = useFractal();

  const daoMetadata = useMemo(() => {
    if (storeState && storeState.node && storeState.node.daoAddress) {
      switch (storeState.node.daoAddress) {
        case lizzardsDAOMetadata.address:
          return lizzardsDAOMetadata;
        default:
          return undefined;
      }
    }
    return undefined;
  }, [storeState]);

  return daoMetadata;
}
