import * as amplitude from '@amplitude/analytics-browser';
import { Box, Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DaoHierarchyNode } from '../../../components/DaoHierarchy/DaoHierarchyNode';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../constants/common';
import { analyticsEvents } from '../../../insights/analyticsEvents';
import { useFractal } from '../../../providers/App/AppProvider';

export function SafeHierarchyPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.HierarchyPageOpened);
  }, []);

  const {
    node: {
      daoAddress,
      daoName,
      nodeHierarchy: { parentAddress },
      isHierarchyLoaded,
    },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');

  const HEADER_HEIGHT = useHeaderHeight();

  if (!daoAddress || !isHierarchyLoaded) {
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
          subject: t('nodes'),
        })}
        breadcrumbs={[
          {
            terminus: t('nodes'),
            path: '',
          },
        ]}
      />
      <DaoHierarchyNode
        parentAddress={null}
        daoAddress={parentAddress || daoAddress}
        depth={0}
      />
    </Box>
  );
}
