import { Box } from '@chakra-ui/react';
import { Activities } from '../../../src/components/pages/DaoDashboard/Activities';
import { Info } from '../../../src/components/pages/DaoDashboard/Info';
import { TokenClaim } from '../../../src/components/pages/DaoDashboard/TokenClaim';
import useDAOController from '../../../src/hooks/DAO/useDAOController';

export default function DaoDashboardPage() {
  useDAOController();
  return (
    <Box mt={12}>
      <Info />
      <TokenClaim />
      <Activities />
    </Box>
  );
}
