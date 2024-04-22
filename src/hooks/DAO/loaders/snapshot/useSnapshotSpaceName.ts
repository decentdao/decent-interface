import { useFractal } from '../../../../providers/App/AppProvider';

export default function useSnapshotSpaceName() {
  const {
    node: { daoSnapshotENS },
  } = useFractal();

  return daoSnapshotENS;
}
