import { Flex, Show } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import SettingsNavigation from '../../../../components/pages/SafeSettings/SettingsNavigation';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function SafeSettingsPage() {
  const { t } = useTranslation(['settings']);
  const { node } = useFractal();
  return (
    <>
      <Show above="md">
        <PageHeader
          breadcrumbs={[
            {
              terminus: t('settings', { ns: 'breadcrumbs' }),
              path: '',
            },
          ]}
          title={t('settingsPageTitle', { daoName: node?.daoName })}
        />
      </Show>
      <Flex gap="0.5rem">
        <SettingsNavigation />
        <Outlet />
      </Flex>
    </>
  );
}
