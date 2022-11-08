import { Box } from '@chakra-ui/react';
import { Activities } from './Activities';
import { Info } from './Info';

export function DaoDashboard() {
  return (
    <Box p="1.5rem">
      <Info />
      <Activities />
    </Box>
  );
}
