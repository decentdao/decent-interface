import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import SettingsNavigation from '../../../components/SafeSettings/SettingsNavigation';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';

export function SafeSettingsPage() {
  const { t } = useTranslation(['settings']);
  const { daoName } = useDaoInfoStore();
  const location = useLocation();
  const paths = location.pathname.split('/');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isIndexSettingsPage = paths.length === 2;

  return (
    <>
      {(!isMobile || isIndexSettingsPage) && (
        <PageHeader
          breadcrumbs={[
            {
              terminus: t('settings', { ns: 'breadcrumbs' }),
              path: '',
            },
          ]}
          title={t('settingsPageTitle', { daoName })}
        />
      )}
      <Flex flexDirection={{ base: 'column', md: 'row' }}>
        {(!isMobile || isIndexSettingsPage) && <SettingsNavigation />}
        {(!isMobile || (isMobile && !isIndexSettingsPage)) && <Outlet />}
      </Flex>
    </>
  );
}
