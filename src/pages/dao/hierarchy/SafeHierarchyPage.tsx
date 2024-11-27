import * as amplitude from '@amplitude/analytics-browser';
import { Box, Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DaoHierarchyNode } from '../../../components/DaoHierarchy/DaoHierarchyNode';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../constants/common';
import { analyticsEvents } from '../../../insights/analyticsEvents';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';

export function SafeHierarchyPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.HierarchyPageOpened);
  }, []);

  const { safe, subgraphInfo } = useDaoInfoStore();

  const { t } = useTranslation('breadcrumbs');

  const HEADER_HEIGHT = useHeaderHeight();

  const safeAddress = safe?.address;

  if (!safeAddress || !subgraphInfo) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }
  const { daoName, parentAddress } = subgraphInfo;

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
        safeAddress={parentAddress || safeAddress}
        depth={0}
      />
    </Box>
  );
}
