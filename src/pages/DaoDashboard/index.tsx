import { Box } from '@chakra-ui/react';
import { Activities } from './Activities';
import { Info } from './Info';

export function DaoDashboard() {
  return (
    <Box
      py="1.5rem"
      px={{ sm: '1rem', xl: 'auto' }}
    >
      <Info />
      <Activities />
    </Box>
  );
}
