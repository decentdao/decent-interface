import * as amplitude from '@amplitude/analytics-browser';
import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DAOSettingsContent } from '../../../components/pages/DaoSettings/DAOSettingsContent';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../constants/common';
import { analyticsEvents } from '../../../insights/analyticsEvents';
import { useFractal } from '../../../providers/App/AppProvider';

export function SettingsPage() {
  amplitude.track(analyticsEvents.SafeSettingsPageOpened);

  const { t } = useTranslation('breadcrumbs');
  const {
    node: { daoAddress, daoName },
  } = useFractal();

  const HEADER_HEIGHT = useHeaderHeight();

  if (!daoAddress) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }
  return (
    <Box>
      <PageHeader
        title={t('headerTitle', {
          daoName,
          subject: t('settings'),
        })}
        breadcrumbs={[
          {
            terminus: t('settings'),
            path: '',
          },
        ]}
      />
      <DAOSettingsContent />
    </Box>
  );
}
