'use client';

import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../src/components/pages/DaoDashboard/ERC20Claim';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';

export default function DaoDashboardPage() {
  return (
    <ClientOnly>
      <Box mt={12}>
        <Info />
        <ERCO20Claim />
        <Activities />
      </Box>
    </ClientOnly>
  );
}
