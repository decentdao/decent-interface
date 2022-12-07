import { Box } from '@chakra-ui/react';
import { Activities } from './Activities';
import { Freeze } from './Freeze';
import { Info } from './Info';

export function DaoDashboard() {
  return (
    <Box mt={12}>
      <Freeze />
      <Info />
      <Activities />
    </Box>
  );
}
