import { useFractal } from '../../../../providers/App/AppProvider';

export default function useSnapshotSpaceName() {
  const {
    node: { daoSnapshotURL },
  } = useFractal();

  return daoSnapshotURL?.split('/').pop();
}
