import { useTranslation } from 'react-i18next';
import NestedPageHeader from '../../ui/page/Header/NestedPageHeader';
import GovernanceContainer from './components/GovernanceContainer';

export default function DAOGovernanceSettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <>
      <NestedPageHeader
        title={t('daoSettingsGovernance')}
        backButtonText={t('settings')}
      />
      <GovernanceContainer />
    </>
  );
}
