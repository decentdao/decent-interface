import { useTranslation } from 'react-i18next';
import NestedPageHeader from '../../ui/page/Header/NestedPageHeader';
import { GeneralSettingsContainer } from './components/GeneralSettingsContainer';

export default function DAOGeneralSettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <>
      <NestedPageHeader
        title={t('daoSettingsGeneral')}
        backButtonText={t('settings')}
      />
      <GeneralSettingsContainer />
    </>
  );
}
