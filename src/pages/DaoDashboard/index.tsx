import { Box } from '@chakra-ui/react';
import { Activities } from './Activities';
import { Info } from './Info';
import { TokenClaim } from './TokenClaim';

export function DaoDashboard() {
  return (
    <Box mt={12}>
      <Info />
      <TokenClaim />
      <Activities />
    </Box>
  );
}
