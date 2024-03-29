import { Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DaoNode } from '../../../../components/pages/DaoHierarchy/DaoNode';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { HEADER_HEIGHT } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';

export default function HierarchyPage() {
  const {
    node: { daoAddress, daoNetwork, daoName, nodeHierarchy },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');

  if (!daoAddress || !daoNetwork) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <div>
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
      <DaoNode
        daoAddress={nodeHierarchy.parentAddress || daoAddress}
        daoNetwork={daoNetwork}
        depth={0}
      />
    </div>
  );
}
