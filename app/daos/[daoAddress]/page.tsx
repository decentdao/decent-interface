'use client';

import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import { TokenClaim } from '../../../src/components/pages/DaoDashboard/TokenClaim';
import ClientOnly from '../../../src/components/ui/utils/ClientOnly';

export default function DaoDashboardPage() {
  return (
    <ClientOnly>
      <Box mt={12}>
        <Info />
        <TokenClaim />
        <Activities />
      </Box>
    </ClientOnly>
  );
}
