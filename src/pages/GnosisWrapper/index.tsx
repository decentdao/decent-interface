import H1 from '../../components/ui/H1';
import { useGnosisWrapper } from '../../providers/gnosis/hooks/useGnosisWrapper';
import GnosisSafeLink from '../../components/ui/GnosisSafeLink';
import { useTranslation } from 'react-i18next';

export function GnosisWrapper() {
  const {
    state: { safeAddress },
  } = useGnosisWrapper();
  const { t } = useTranslation();
  return (
    <div>
      <H1>Gnosis Safe</H1>
      <div className="flex">
        <GnosisSafeLink
          address={safeAddress}
          label={t('labelGnosis')}
        />
      </div>
    </div>
  );
}
