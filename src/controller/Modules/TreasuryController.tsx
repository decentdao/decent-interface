import { GnosisTreasuryInjector } from './injectors/GnosisTreasuryInjector';
import { GnosisProvider } from '../../providers/gnosis/GnosisProvider';
import { useParams } from 'react-router-dom';

export function TreasuryController({ children }: { children: JSX.Element }) {
  const params = useParams();
  return (
    <GnosisProvider safeAddress={params.address}>
      <GnosisTreasuryInjector>{children}</GnosisTreasuryInjector>
    </GnosisProvider>
  );
}
