'use client';

import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import { TokenClaim } from '../../../src/components/pages/DaoDashboard/TokenClaim';

export default function DaoDashboardPage() {
  return (
    <Box mt={12}>
      <Info />
      <TokenClaim />
      <Activities />
    </Box>
  );
}
