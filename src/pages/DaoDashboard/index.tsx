import { Box } from '@chakra-ui/react';
import { Activities } from './Activities';
import { Info } from './Info';

export function DaoDashboard() {
  return (
    <Box mt={12}>
      <Info />
      <Activities />
    </Box>
  );
}
