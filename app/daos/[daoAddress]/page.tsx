'use client';

import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../src/components/pages/DaoDashboard/ERC20Claim';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';

export default function DaoDashboardPage() {
  return (
    <Box mt={12}>
      <Info />
      <ERCO20Claim />
      <Activities />
    </Box>
  );
}
