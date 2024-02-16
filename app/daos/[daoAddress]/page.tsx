'use client';

import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../src/components/pages/DaoDashboard/ERC20Claim';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import InfoHeader from '../../../src/components/pages/DaoDashboard/Info/InfoHeader';
import useDAOMetadata from '../../../src/hooks/DAO/useDAOMetadata';

export default function DaoDashboardPage() {
  const daoMetadata = useDAOMetadata();

  return (
    <>
      <InfoHeader />
      <Box mt={!!daoMetadata ? 40 : 12}>
        <Info />
        <ERCO20Claim />
        <Activities />
      </Box>
    </>
  );
}
