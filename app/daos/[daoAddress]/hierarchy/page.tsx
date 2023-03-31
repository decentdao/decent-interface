'use client';

import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DaoNode } from '../../../../src/components/pages/DaoHierarchy/DaoNode';
import { BarLoader } from '../../../../src/components/ui/loaders/BarLoader';
import PageHeader from '../../../../src/components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../../../src/constants/common';
import { useFractal } from '../../../../src/providers/Fractal/hooks/useFractal';

export default function HierarchyPage() {
  const {
    gnosis: { safe, parentAddress },
  } = useFractal();
  const { t } = useTranslation(['breadcrubms']);

  if (!safe.address) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <Box>
      <PageHeader
        breadcrumbs={[
          {
            title: t('nodes', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      />
      <DaoNode
        safeAddress={parentAddress || safe.address}
        trueDepth={0}
      />
    </Box>
  );
}
