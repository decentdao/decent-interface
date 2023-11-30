import { useMemo } from 'react';
import lizzardsDAOMetadata from '../../metadata/lizzardsDAO';
import { useFractal } from '../../providers/App/AppProvider';

export default function useDAOMetadata() {
  const {
    node: { daoAddress },
  } = useFractal();

  const daoMetadata = useMemo(() => {
    switch (daoAddress) {
      case lizzardsDAOMetadata.address:
        return lizzardsDAOMetadata;
      default:
        return undefined;
    }
  }, [daoAddress]);

  return daoMetadata;
}
