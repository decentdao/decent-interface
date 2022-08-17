import H1 from '../../components/ui/H1';
import { useGnosisWrapper } from '../../providers/gnosis/hooks/useGnosisWrapper';
import GnosisSafeLink from '../../components/ui/GnosisSafeLink';

export function GnosisWrapper() {
  const { gnosisSafeAddress } = useGnosisWrapper();
  return (
    <div>
      <H1>Gnosis Safe</H1>
      <GnosisSafeLink address={gnosisSafeAddress}>Gnosis Safe</GnosisSafeLink>
    </div>
  );
}
