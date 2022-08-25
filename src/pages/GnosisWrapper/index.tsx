import H1 from '../../components/ui/H1';
import { useGnosisWrapper } from '../../providers/gnosis/hooks/useGnosisWrapper';
import GnosisSafeLink from '../../components/ui/GnosisSafeLink';
import { PrimaryButton } from '../../components/ui/forms/Button';
import { NavLink } from 'react-router-dom';

export function GnosisWrapper() {
  const { gnosisSafeAddress } = useGnosisWrapper();
  return (
    <div>
      <H1>Gnosis Safe</H1>
      <div className="flex">
        <GnosisSafeLink
          address={gnosisSafeAddress}
          label="Gnosis Safe"
        />
        <NavLink to="proposals/new">
          <PrimaryButton label="Create Proposal" />
        </NavLink>
      </div>
    </div>
  );
}
