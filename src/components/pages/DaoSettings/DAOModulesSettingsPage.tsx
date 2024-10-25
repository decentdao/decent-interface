import { useTranslation } from 'react-i18next';
import NestedPageHeader from '../../ui/page/Header/NestedPageHeader';
import { ModulesContainer } from './components/ModulesContainer';

export default function DAOModulesSettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <>
      <NestedPageHeader
        title={t('daoModulesAndGuard')}
        backButtonText={t('settings')}
      />
      <ModulesContainer />
    </>
  );
}
