import { useTranslation } from 'react-i18next';
import NestedPageHeader from '../../ui/page/Header/NestedPageHeader';
import { PermissionsContent } from './components/PermissionsContainer';

export default function DAOPermissionsSettingsPage() {
  const { t } = useTranslation('settings');
  return (
    <>
      <NestedPageHeader
        title={t('permissionsTitle')}
        backButtonText={t('settings')}
      />
      <PermissionsContent />
    </>
  );
}
