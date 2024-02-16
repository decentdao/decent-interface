'use client';

import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../../src/components/pages/DaoSettings';
import { BarLoader } from '../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../../../src/constants/common';
import { useFractal } from '../../../../src/providers/App/AppProvider';

export default function SettingsPage() {
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
    <Box mt={12}>
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
      <Settings />
    </Box>
  );
}
