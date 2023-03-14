import { Grid } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function ProposalDetailsGrid({ children }: { children: ReactNode }) {
  return (
    <Grid
      gap={{ base: 0, lg: 4 }}
      templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }}
    >
      {children}
    </Grid>
  );
}
