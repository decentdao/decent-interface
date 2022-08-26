import H1 from '../../components/ui/H1';
import { useGnosisWrapper } from '../../providers/gnosis/hooks/useGnosisWrapper';
import GnosisSafeLink from '../../components/ui/GnosisSafeLink';

export function GnosisWrapper() {
  const {
    state: { contractAddress },
  } = useGnosisWrapper();
  return (
    <div>
      <H1>Gnosis Safe</H1>
      <div className="flex">
        <GnosisSafeLink
          address={contractAddress}
          label="Gnosis Safe"
        />
      </div>
    </div>
  );
}
