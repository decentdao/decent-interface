import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import { TokenClaim } from '../../../src/components/pages/DaoDashboard/TokenClaim';
import useDAOController from '../../../src/hooks/DAO/useDAOController';

export default function DaoDashboardPage() {
  // TODO: There's a good place for improvement - using Next.js experimental layouts feature
  // However, given that it is still experimental - there will be better timing to introduce them
  useDAOController(); // Then such "global" hooks are gonna be lying in single-usage place
  return (
    <Box mt={12}>
      <Info />
      <TokenClaim />
      <Activities />
    </Box>
  );
}
