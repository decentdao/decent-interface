import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { BarLoader } from '../../components/ui/loaders/BarLoader';
import PageHeader from '../../components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../constants/common';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { DaoNode } from './DaoNode';

export function FractalNodes() {
  const {
    gnosis: { safe, parentDAOAddress },
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
        safeAddress={parentDAOAddress || safe.address}
        trueDepth={0}
      />
    </Box>
  );
}
