'use client';

import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CreateIntegrationForm from '../../../../../src/components/CreateIntegration';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import { useFractal } from '../../../../../src/providers/Fractal/hooks/useFractal';

export default function CreateIntegrationPage() {
  const { t } = useTranslation();
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('integrations', { ns: 'breadcrumbs' }),
            path: DAO_ROUTES.integrations.relative(address),
          },
          {
            title: t('integrationNew', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      />
      <CreateIntegrationForm />
    </Box>
  );
}
