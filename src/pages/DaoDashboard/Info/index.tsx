import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { InfoDAO } from './InfoDAO';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';

function InfoCard({
  minWidth,
  children,
}: {
  minWidth: { [key: string]: string };
  children?: ReactNode;
}) {
  return (
    <Box
      flexGrow={1}
      minWidth={minWidth}
      bg="black.900-semi-transparent"
      p="1rem"
      borderRadius="0.5rem"
    >
      {children}
    </Box>
  );
}

export function Info() {
  return (
    <Flex
      flexWrap="wrap"
      gap="1.5rem"
      minH="10.5rem"
      justifyContent="center"
      mb="1rem"
    >
      <InfoCard minWidth={{ sm: '100%', xl: '41.5rem' }}>
        <InfoDAO />
      </InfoCard>
      <InfoCard minWidth={{ sm: '100%', xl: '14.4375rem' }}>
        <InfoGovernance />
      </InfoCard>
      <InfoCard minWidth={{ sm: '100%', md: '45%', xl: '10.3125rem' }}>
        <InfoProposals />
      </InfoCard>
      <InfoCard minWidth={{ sm: '100%', md: '45%', xl: '9.25rem' }}>
        <InfoTreasury />
      </InfoCard>
    </Flex>
  );
}
