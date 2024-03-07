'use client';

import { Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../../components/pages/DaoSettings';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import ClientOnly from '../../../../components/ui/utils/ClientOnly';
import { HEADER_HEIGHT } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';

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
    <ClientOnly mt={12}>
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
    </ClientOnly>
  );
}
