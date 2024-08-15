import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DaoHierarchyNode } from '../../../../components/pages/DaoHierarchy/DaoHierarchyNode';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function HierarchyPage() {
  const {
    node: {
      safe,
      daoName,
      nodeHierarchy: { parentAddress },
      isHierarchyLoaded,
    },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');

  const HEADER_HEIGHT = useHeaderHeight();

  const safeAddress = safe?.address;

  if (!safeAddress || !isHierarchyLoaded) {
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
        safeAddress={parentAddress || safeAddress}
        depth={0}
      />
    </Box>
  );
}
