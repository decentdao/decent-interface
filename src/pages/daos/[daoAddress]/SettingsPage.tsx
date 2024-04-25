import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DAOSettingsContent } from '../../../components/pages/DaoSettings/DAOSettingsContent';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';

export function SettingsPage() {
  const { t } = useTranslation('breadcrumbs');
  const {
    node: { daoAddress, daoName },
  } = useFractal();

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
